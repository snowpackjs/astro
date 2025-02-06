/*
  NOTE: Do not add any dependencies or imports in this file so that it can load quickly in dev.
*/

const debug = import.meta.env.DEV ? console.debug : undefined;
const inBrowser = import.meta.env.SSR === false;
// Track prefetched URLs so we don't prefetch twice
const prefetchedUrls = new Set<string>();
// Track listened anchors so we don't attach duplicated listeners
const listenedAnchors = new WeakSet<HTMLAnchorElement>();

// User-defined config for prefetch. The values are injected by vite-plugin-prefetch
// and can be undefined if not configured. But it will be set a fallback value in `init()`.
// @ts-expect-error injected global
let prefetchAll: boolean = __PREFETCH_PREFETCH_ALL__;
// @ts-expect-error injected global
let defaultStrategy: string = __PREFETCH_DEFAULT_STRATEGY__;
// @ts-expect-error injected global
let clientPrerender: boolean = __EXPERIMENTAL_CLIENT_PRERENDER__;

interface InitOptions {
	defaultStrategy?: string;
	prefetchAll?: boolean;
}

let inited = false;
/**
 * Initialize the prefetch script, only works once.
 *
 * @param defaultOpts Default options for prefetching if not already set by the user config.
 */
export function init(defaultOpts?: InitOptions) {
	if (!inBrowser) return;

	// Init only once
	if (inited) return;
	inited = true;

	debug?.(`[astro] Initializing prefetch script`);

	// Fallback default values if not set by user config
	prefetchAll ??= defaultOpts?.prefetchAll ?? false;
	defaultStrategy ??= defaultOpts?.defaultStrategy ?? 'hover';

	// In the future, perhaps we can enable treeshaking specific unused strategies
	initTapStrategy();
	initHoverStrategy();
	initViewportStrategy();
	initLoadStrategy();
}

/**
 * Prefetch links with higher priority when the user taps on them
 */
function initTapStrategy() {
	for (const event of ['touchstart', 'mousedown']) {
		document.body.addEventListener(
			event,
			(e) => {
				if (elMatchesStrategy(e.target, 'tap')) {
					prefetch(e.target.href, { ignoreSlowConnection: true });
				}
			},
			{ passive: true },
		);
	}
}

/**
 * Prefetch links with higher priority when the user hovers over them
 */
function initHoverStrategy() {
	let timeout: number;

	// Handle focus listeners
	document.body.addEventListener(
		'focusin',
		(e) => {
			if (elMatchesStrategy(e.target, 'hover')) {
				handleHoverIn(e);
			}
		},
		{ passive: true },
	);
	document.body.addEventListener('focusout', handleHoverOut, { passive: true });

	// Handle hover listeners. Re-run each time on page load.
	onPageLoad(() => {
		for (const anchor of document.getElementsByTagName('a')) {
			// Skip if already listening
			if (listenedAnchors.has(anchor)) continue;
			// Add listeners for anchors matching the strategy
			if (elMatchesStrategy(anchor, 'hover')) {
				listenedAnchors.add(anchor);
				anchor.addEventListener('mouseenter', handleHoverIn, { passive: true });
				anchor.addEventListener('mouseleave', handleHoverOut, { passive: true });
			}
		}
	});

	function handleHoverIn(e: Event) {
		const href = (e.target as HTMLAnchorElement).href;

		// Debounce hover prefetches by 80ms
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			prefetch(href);
		}, 80) as unknown as number;
	}

	// Cancel prefetch if the user hovers away
	function handleHoverOut() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = 0;
		}
	}
}

/**
 * Prefetch links with lower priority as they enter the viewport
 */
function initViewportStrategy() {
	let observer: IntersectionObserver;

	onPageLoad(() => {
		for (const anchor of document.getElementsByTagName('a')) {
			// Skip if already listening
			if (listenedAnchors.has(anchor)) continue;
			// Observe for anchors matching the strategy
			if (elMatchesStrategy(anchor, 'viewport')) {
				listenedAnchors.add(anchor);
				observer ??= createViewportIntersectionObserver();
				observer.observe(anchor);
			}
		}
	});
}

function createViewportIntersectionObserver() {
	const timeouts = new WeakMap<HTMLAnchorElement, number>();

	return new IntersectionObserver((entries, observer) => {
		for (const entry of entries) {
			const anchor = entry.target as HTMLAnchorElement;
			const timeout = timeouts.get(anchor);
			// Prefetch if intersecting
			if (entry.isIntersecting) {
				// Debounce viewport prefetches by 300ms
				if (timeout) {
					clearTimeout(timeout);
				}
				timeouts.set(
					anchor,
					setTimeout(() => {
						observer.unobserve(anchor);
						timeouts.delete(anchor);
						prefetch(anchor.href);
					}, 300) as unknown as number,
				);
			} else {
				// If exited viewport but haven't prefetched, cancel it
				if (timeout) {
					clearTimeout(timeout);
					timeouts.delete(anchor);
				}
			}
		}
	});
}

/**
 * Prefetch links with lower priority when page load
 */
function initLoadStrategy() {
	onPageLoad(() => {
		for (const anchor of document.getElementsByTagName('a')) {
			if (elMatchesStrategy(anchor, 'load')) {
				// Prefetch every link in this page
				prefetch(anchor.href);
			}
		}
	});
}

export interface PrefetchOptions {
	/**
	 * How the prefetch should prioritize the URL. (default `'link'`)
	 * - `'link'`: use `<link rel="prefetch">`.
	 * - `'fetch'`: use `fetch()`.
	 *
	 * @deprecated It is recommended to not use this option, and let prefetch use `'link'` whenever it's supported,
	 * or otherwise fall back to `'fetch'`. `'link'` works better if the URL doesn't set an appropriate cache header,
	 * as the browser will continue to cache it as long as it's used subsequently.
	 */
	with?: 'link' | 'fetch';
	/**
	 * Should prefetch even on data saver mode or slow connection. (default `false`)
	 */
	ignoreSlowConnection?: boolean;
}

/**
 * Prefetch a URL so it's cached when the user navigates to it.
 *
 * @param url A full or partial URL string based on the current `location.href`. They are only fetched if:
 *   - The user is online
 *   - The user is not in data saver mode
 *   - The URL is within the same origin
 *   - The URL is not the current page
 *   - The URL has not already been prefetched
 * @param opts Additional options for prefetching.
 */
export function prefetch(url: string, opts?: PrefetchOptions) {
	// Remove url hash to avoid prefetching the same URL multiple times
	url = url.replace(/#.*/, '');

	const ignoreSlowConnection = opts?.ignoreSlowConnection ?? false;
	if (!canPrefetchUrl(url, ignoreSlowConnection)) return;
	prefetchedUrls.add(url);

	// Prefetch with speculationrules if `clientPrerender` is enabled and supported
	// NOTE: This condition is tree-shaken if `clientPrerender` is false as its a static value
	if (clientPrerender && HTMLScriptElement.supports?.('speculationrules')) {
		debug?.(`[astro] Prefetching ${url} with <script type="speculationrules">`);
		appendSpeculationRules(url);
	}
	// Prefetch with link if supported
	else if (
		document.createElement('link').relList?.supports?.('prefetch') &&
		opts?.with !== 'fetch'
	) {
		debug?.(`[astro] Prefetching ${url} with <link rel="prefetch">`);
		const link = document.createElement('link');
		link.rel = 'prefetch';
		link.setAttribute('href', url);
		document.head.append(link);
	}
	// Otherwise, fallback prefetch with fetch
	else {
		debug?.(`[astro] Prefetching ${url} with fetch`);
		fetch(url, { priority: 'low' });
	}
}

function canPrefetchUrl(url: string, ignoreSlowConnection: boolean) {
	// Skip prefetch if offline
	if (!navigator.onLine) return false;
	// Skip prefetch if using data saver mode or slow connection
	if (!ignoreSlowConnection && isSlowConnection()) return false;
	// Else check if URL is within the same origin, not the current page, and not already prefetched
	try {
		const urlObj = new URL(url, location.href);
		return (
			location.origin === urlObj.origin &&
			(location.pathname !== urlObj.pathname || location.search !== urlObj.search) &&
			!prefetchedUrls.has(url)
		);
	} catch {}
	return false;
}

function elMatchesStrategy(el: EventTarget | null, strategy: string): el is HTMLAnchorElement {
	// @ts-expect-error access unknown property this way as it's more performant
	if (el?.tagName !== 'A') return false;
	const attrValue = (el as HTMLElement).dataset.astroPrefetch;

	// Out-out if `prefetchAll` is enabled
	if (attrValue === 'false') {
		return false;
	}

	// Fallback to tap strategy if using data saver mode or slow connection
	if (strategy === 'tap' && (attrValue != null || prefetchAll) && isSlowConnection()) {
		return true;
	}

	// If anchor has no dataset but we want to prefetch all, or has dataset but no value,
	// check against fallback default strategy
	if ((attrValue == null && prefetchAll) || attrValue === '') {
		return strategy === defaultStrategy;
	}
	// Else if dataset is explicitly defined, check against it
	if (attrValue === strategy) {
		return true;
	}
	// Else, no match
	return false;
}

function isSlowConnection() {
	if ('connection' in navigator) {
		// Untyped Chrome-only feature: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/connection
		const conn = navigator.connection as any;
		return conn.saveData || /2g/.test(conn.effectiveType);
	}
	return false;
}

/**
 * Listen to page loads and handle Astro's View Transition specific events
 */
function onPageLoad(cb: () => void) {
	cb();
	// Ignore first call of `astro-page-load` as we already call `cb` above.
	// We have to call `cb` eagerly as View Transitions may not be enabled.
	let firstLoad = false;
	document.addEventListener('astro:page-load', () => {
		if (!firstLoad) {
			firstLoad = true;
			return;
		}
		cb();
	});
}

/**
 * Appends a `<script type="speculationrules">` tag to the head of the
 * document that prerenders the `url` passed in.
 *
 * Modifying the script and appending a new link does not trigger the prerender.
 * A new script must be added for each `url`.
 *
 * @param url The url of the page to prerender.
 */
function appendSpeculationRules(url: string) {
	const script = document.createElement('script');
	script.type = 'speculationrules';
	script.textContent = JSON.stringify({
		prerender: [
			{
				source: 'list',
				urls: [url],
			},
		],
		// Currently, adding `prefetch` is required to fallback if `prerender` fails.
		// Possibly will be automatic in the future, in which case it can be removed.
		// https://github.com/WICG/nav-speculation/issues/162#issuecomment-1977818473
		prefetch: [
			{
				source: 'list',
				urls: [url],
			},
		],
	});
	document.head.append(script);
}

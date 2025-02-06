import type { TransitionBeforePreparationEvent } from './events.js';
import { TRANSITION_AFTER_SWAP, doPreparation, doSwap } from './events.js';
import type { Direction, Fallback, Options } from './types.js';

type State = {
	index: number;
	scrollX: number;
	scrollY: number;
};
type Events = 'astro:page-load' | 'astro:after-swap';
type Navigation = { controller: AbortController };
type Transition = {
	// The view transitions object (API and simulation)
	viewTransition?: ViewTransition;
	// Simulation: Whether transition was skipped
	transitionSkipped: boolean;
	// Simulation: The resolve function of the finished promise
	viewTransitionFinished?: () => void;
};

// Create bound versions of pushState/replaceState so that Partytown doesn't hijack them,
// which breaks Firefox.
const inBrowser = import.meta.env.SSR === false;
const pushState = (inBrowser && history.pushState.bind(history)) as typeof history.pushState;
const replaceState = (inBrowser &&
	history.replaceState.bind(history)) as typeof history.replaceState;

// only update history entries that are managed by us
// leave other entries alone and do not accidently add state.
export const updateScrollPosition = (positions: { scrollX: number; scrollY: number }) => {
	if (history.state) {
		history.scrollRestoration = 'manual';
		replaceState({ ...history.state, ...positions }, '');
	}
};

export const supportsViewTransitions = inBrowser && !!document.startViewTransition;

export const transitionEnabledOnThisPage = () =>
	inBrowser && !!document.querySelector('[name="astro-view-transitions-enabled"]');

const samePage = (thisLocation: URL, otherLocation: URL) =>
	thisLocation.pathname === otherLocation.pathname && thisLocation.search === otherLocation.search;

// The previous navigation that might still be in processing
let mostRecentNavigation: Navigation | undefined;
// The previous transition that might still be in processing
let mostRecentTransition: Transition | undefined;
// When we traverse the history, the window.location is already set to the new location.
// This variable tells us where we came from
let originalLocation: URL;

const triggerEvent = (name: Events) => document.dispatchEvent(new Event(name));
const onPageLoad = () => triggerEvent('astro:page-load');
const announce = () => {
	let div = document.createElement('div');
	div.setAttribute('aria-live', 'assertive');
	div.setAttribute('aria-atomic', 'true');
	div.className = 'astro-route-announcer';
	document.body.append(div);
	setTimeout(
		() => {
			let title = document.title || document.querySelector('h1')?.textContent || location.pathname;
			div.textContent = title;
		},
		// Much thought went into this magic number; the gist is that screen readers
		// need to see that the element changed and might not do so if it happens
		// too quickly.
		60,
	);
};

const PERSIST_ATTR = 'data-astro-transition-persist';
const DIRECTION_ATTR = 'data-astro-transition';
const OLD_NEW_ATTR = 'data-astro-transition-fallback';

const VITE_ID = 'data-vite-dev-id';

let parser: DOMParser;

// The History API does not tell you if navigation is forward or back, so
// you can figure it using an index. On pushState the index is incremented so you
// can use that to determine popstate if going forward or back.
let currentHistoryIndex = 0;

if (inBrowser) {
	if (history.state) {
		// Here we reloaded a page with history state
		// (e.g. history navigation from non-transition page or browser reload)
		currentHistoryIndex = history.state.index;
		scrollTo({ left: history.state.scrollX, top: history.state.scrollY });
	} else if (transitionEnabledOnThisPage()) {
		// This page is loaded from the browser address bar or via a link from extern,
		// it needs a state in the history
		replaceState({ index: currentHistoryIndex, scrollX, scrollY }, '');
		history.scrollRestoration = 'manual';
	}
}

// returns the contents of the page or null if the router can't deal with it.
async function fetchHTML(
	href: string,
	init?: RequestInit,
): Promise<null | { html: string; redirected?: string; mediaType: DOMParserSupportedType }> {
	try {
		const res = await fetch(href, init);
		const contentType = res.headers.get('content-type') ?? '';
		// drop potential charset (+ other name/value pairs) as parser needs the mediaType
		const mediaType = contentType.split(';', 1)[0].trim();
		// the DOMParser can handle two types of HTML
		if (mediaType !== 'text/html' && mediaType !== 'application/xhtml+xml') {
			// everything else (e.g. audio/mp3) will be handled by the browser but not by us
			return null;
		}
		const html = await res.text();
		return {
			html,
			redirected: res.redirected ? res.url : undefined,
			mediaType,
		};
	} catch {
		// can't fetch, let someone else deal with it.
		return null;
	}
}

export function getFallback(): Fallback {
	const el = document.querySelector('[name="astro-view-transitions-fallback"]');
	if (el) {
		return el.getAttribute('content') as Fallback;
	}
	return 'animate';
}

function runScripts() {
	let wait = Promise.resolve();
	for (const script of document.getElementsByTagName('script')) {
		if (script.dataset.astroExec === '') continue;
		const type = script.getAttribute('type');
		if (type && type !== 'module' && type !== 'text/javascript') continue;
		const newScript = document.createElement('script');
		newScript.innerHTML = script.innerHTML;
		for (const attr of script.attributes) {
			if (attr.name === 'src') {
				const p = new Promise((r) => {
					newScript.onload = newScript.onerror = r;
				});
				wait = wait.then(() => p as any);
			}
			newScript.setAttribute(attr.name, attr.value);
		}
		newScript.dataset.astroExec = '';
		script.replaceWith(newScript);
	}
	return wait;
}

// Add a new entry to the browser history. This also sets the new page in the browser address bar.
// Sets the scroll position according to the hash fragment of the new location.
const moveToLocation = (
	to: URL,
	from: URL,
	options: Options,
	pageTitleForBrowserHistory: string,
	historyState?: State,
) => {
	const intraPage = samePage(from, to);

	const targetPageTitle = document.title;
	document.title = pageTitleForBrowserHistory;

	let scrolledToTop = false;
	if (to.href !== location.href && !historyState) {
		if (options.history === 'replace') {
			const current = history.state;
			replaceState(
				{
					...options.state,
					index: current.index,
					scrollX: current.scrollX,
					scrollY: current.scrollY,
				},
				'',
				to.href,
			);
		} else {
			pushState(
				{ ...options.state, index: ++currentHistoryIndex, scrollX: 0, scrollY: 0 },
				'',
				to.href,
			);
		}
	}
	document.title = targetPageTitle;
	// now we are on the new page for non-history navigation!
	// (with history navigation page change happens before popstate is fired)
	originalLocation = to;

	// freshly loaded pages start from the top
	if (!intraPage) {
		scrollTo({ left: 0, top: 0, behavior: 'instant' });
		scrolledToTop = true;
	}

	if (historyState) {
		scrollTo(historyState.scrollX, historyState.scrollY);
	} else {
		if (to.hash) {
			// because we are already on the target page ...
			// ... what comes next is a intra-page navigation
			// that won't reload the page but instead scroll to the fragment
			history.scrollRestoration = 'auto';
			const savedState = history.state;
			location.href = to.href; // this kills the history state on Firefox
			if (!history.state) {
				replaceState(savedState, ''); // this restores the history state
				if (intraPage) {
					window.dispatchEvent(new PopStateEvent('popstate'));
				}
			}
		} else {
			if (!scrolledToTop) {
				scrollTo({ left: 0, top: 0, behavior: 'instant' });
			}
		}
		history.scrollRestoration = 'manual';
	}
};

function preloadStyleLinks(newDocument: Document) {
	const links: Promise<any>[] = [];
	for (const el of newDocument.querySelectorAll('head link[rel=stylesheet]')) {
		// Do not preload links that are already on the page.
		if (
			!document.querySelector(
				`[${PERSIST_ATTR}="${el.getAttribute(
					PERSIST_ATTR,
				)}"], link[rel=stylesheet][href="${el.getAttribute('href')}"]`,
			)
		) {
			const c = document.createElement('link');
			c.setAttribute('rel', 'preload');
			c.setAttribute('as', 'style');
			c.setAttribute('href', el.getAttribute('href')!);
			links.push(
				new Promise<any>((resolve) => {
					['load', 'error'].forEach((evName) => c.addEventListener(evName, resolve));
					document.head.append(c);
				}),
			);
		}
	}
	return links;
}

// replace head and body of the windows document with contents from newDocument
// if !popstate, update the history entry and scroll position according to toLocation
// if popState is given, this holds the scroll position for history navigation
// if fallback === "animate" then simulate view transitions
async function updateDOM(
	preparationEvent: TransitionBeforePreparationEvent,
	options: Options,
	currentTransition: Transition,
	historyState?: State,
	fallback?: Fallback,
) {
	async function animate(phase: string) {
		function isInfinite(animation: Animation) {
			const effect = animation.effect;
			if (!effect || !(effect instanceof KeyframeEffect) || !effect.target) return false;
			const style = window.getComputedStyle(effect.target, effect.pseudoElement);
			return style.animationIterationCount === 'infinite';
		}
		const currentAnimations = document.getAnimations();
		// Trigger view transition animations waiting for data-astro-transition-fallback
		document.documentElement.setAttribute(OLD_NEW_ATTR, phase);
		const nextAnimations = document.getAnimations();
		const newAnimations = nextAnimations.filter(
			(a) => !currentAnimations.includes(a) && !isInfinite(a),
		);
		// Wait for all new animations to finish (resolved or rejected).
		// Do not reject on canceled ones.
		return Promise.allSettled(newAnimations.map((a) => a.finished));
	}

	if (
		fallback === 'animate' &&
		!currentTransition.transitionSkipped &&
		!preparationEvent.signal.aborted
	) {
		try {
			await animate('old');
		} catch {
			// animate might reject as a consequence of a call to skipTransition()
			// ignored on purpose
		}
	}

	const pageTitleForBrowserHistory = document.title; // document.title will be overridden by swap()
	const swapEvent = doSwap(preparationEvent, currentTransition.viewTransition!);
	moveToLocation(swapEvent.to, swapEvent.from, options, pageTitleForBrowserHistory, historyState);
	triggerEvent(TRANSITION_AFTER_SWAP);

	if (fallback === 'animate') {
		if (!currentTransition.transitionSkipped && !swapEvent.signal.aborted) {
			animate('new').finally(() => currentTransition.viewTransitionFinished!());
		} else {
			currentTransition.viewTransitionFinished!();
		}
	}
}

function abortAndRecreateMostRecentNavigation(): Navigation {
	mostRecentNavigation?.controller.abort();
	return (mostRecentNavigation = {
		controller: new AbortController(),
	});
}

async function transition(
	direction: Direction,
	from: URL,
	to: URL,
	options: Options,
	historyState?: State,
) {
	// The most recent navigation always has precedence
	// Yes, there can be several navigation instances as the user can click links
	// while we fetch content or simulate view transitions. Even synchronous creations are possible
	// e.g. by calling navigate() from an transition event.
	// Invariant: all but the most recent navigation are already aborted.

	const currentNavigation = abortAndRecreateMostRecentNavigation();

	// not ours
	if (!transitionEnabledOnThisPage() || location.origin !== to.origin) {
		if (currentNavigation === mostRecentNavigation) mostRecentNavigation = undefined;
		location.href = to.href;
		return;
	}

	const navigationType = historyState
		? 'traverse'
		: options.history === 'replace'
			? 'replace'
			: 'push';

	if (navigationType !== 'traverse') {
		updateScrollPosition({ scrollX, scrollY });
	}
	if (samePage(from, to)) {
		if ((direction !== 'back' && to.hash) || (direction === 'back' && from.hash)) {
			moveToLocation(to, from, options, document.title, historyState);
			if (currentNavigation === mostRecentNavigation) mostRecentNavigation = undefined;
			return;
		}
	}

	const prepEvent = await doPreparation(
		from,
		to,
		direction,
		navigationType,
		options.sourceElement,
		options.info,
		currentNavigation!.controller.signal,
		options.formData,
		defaultLoader,
	);
	if (prepEvent.defaultPrevented || prepEvent.signal.aborted) {
		if (currentNavigation === mostRecentNavigation) mostRecentNavigation = undefined;
		if (!prepEvent.signal.aborted) {
			// not aborted -> delegate to browser
			location.href = to.href;
		}
		// and / or exit
		return;
	}

	async function defaultLoader(preparationEvent: TransitionBeforePreparationEvent) {
		const href = preparationEvent.to.href;
		const init: RequestInit = { signal: preparationEvent.signal };
		if (preparationEvent.formData) {
			init.method = 'POST';
			const form =
				preparationEvent.sourceElement instanceof HTMLFormElement
					? preparationEvent.sourceElement
					: preparationEvent.sourceElement instanceof HTMLElement &&
							'form' in preparationEvent.sourceElement
						? (preparationEvent.sourceElement.form as HTMLFormElement)
						: preparationEvent.sourceElement?.closest('form');
			// Form elements without enctype explicitly set default to application/x-www-form-urlencoded.
			// In order to maintain compatibility with Astro 4.x, we need to check the value of enctype
			// on the attributes property rather than accessing .enctype directly. Astro 5.x may
			// introduce defaulting to application/x-www-form-urlencoded as a breaking change, and then
			// we can access .enctype directly.
			//
			// Note: getNamedItem can return null in real life, even if TypeScript doesn't think so, hence
			// the ?.
			init.body =
				form?.attributes.getNamedItem('enctype')?.value === 'application/x-www-form-urlencoded'
					? new URLSearchParams(preparationEvent.formData as any)
					: preparationEvent.formData;
		}
		const response = await fetchHTML(href, init);
		// If there is a problem fetching the new page, just do an MPA navigation to it.
		if (response === null) {
			preparationEvent.preventDefault();
			return;
		}
		// if there was a redirection, show the final URL in the browser's address bar
		if (response.redirected) {
			const redirectedTo = new URL(response.redirected);
			// but do not redirect cross origin
			if (redirectedTo.origin !== preparationEvent.to.origin) {
				preparationEvent.preventDefault();
				return;
			}
			preparationEvent.to = redirectedTo;
		}

		parser ??= new DOMParser();

		preparationEvent.newDocument = parser.parseFromString(response.html, response.mediaType);
		// The next line might look like a hack,
		// but it is actually necessary as noscript elements
		// and their contents are returned as markup by the parser,
		// see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
		preparationEvent.newDocument.querySelectorAll('noscript').forEach((el) => el.remove());

		// If ClientRouter is not enabled on the incoming page, do a full page load to it.
		// Unless this was a form submission, in which case we do not want to trigger another mutation.
		if (
			!preparationEvent.newDocument.querySelector('[name="astro-view-transitions-enabled"]') &&
			!preparationEvent.formData
		) {
			preparationEvent.preventDefault();
			return;
		}

		const links = preloadStyleLinks(preparationEvent.newDocument);
		links.length && !preparationEvent.signal.aborted && (await Promise.all(links));

		if (import.meta.env.DEV && !preparationEvent.signal.aborted)
			await prepareForClientOnlyComponents(
				preparationEvent.newDocument,
				preparationEvent.to,
				preparationEvent.signal,
			);
	}
	async function abortAndRecreateMostRecentTransition(): Promise<Transition> {
		if (mostRecentTransition) {
			if (mostRecentTransition.viewTransition) {
				try {
					mostRecentTransition.viewTransition.skipTransition();
				} catch {
					// might throw AbortError DOMException. Ignored on purpose.
				}
				try {
					// UpdateCallbackDone might already been settled, i.e. if the previous transition finished updating the DOM.
					// Could not take long, we wait for it to avoid parallel updates
					// (which are very unlikely as long as swap() is not async).
					await mostRecentTransition.viewTransition.updateCallbackDone;
				} catch {
					// There was an error in the update callback of the transition which we cancel.
					// Ignored on purpose
				}
			}
		}
		return (mostRecentTransition = { transitionSkipped: false });
	}

	const currentTransition = await abortAndRecreateMostRecentTransition();

	if (prepEvent.signal.aborted) {
		if (currentNavigation === mostRecentNavigation) mostRecentNavigation = undefined;
		return;
	}

	document.documentElement.setAttribute(DIRECTION_ATTR, prepEvent.direction);
	if (supportsViewTransitions) {
		// This automatically cancels any previous transition
		// We also already took care that the earlier update callback got through
		currentTransition.viewTransition = document.startViewTransition(
			async () => await updateDOM(prepEvent, options, currentTransition, historyState),
		);
	} else {
		// Simulation mode requires a bit more manual work
		const updateDone = (async () => {
			// Immediately paused to setup the ViewTransition object for Fallback mode
			await Promise.resolve(); // hop through the micro task queue
			await updateDOM(prepEvent, options, currentTransition, historyState, getFallback());
			return undefined;
		})();

		// When the updateDone promise is settled,
		// we have run and awaited all swap functions and the after-swap event
		// This qualifies for "updateCallbackDone".
		//
		// For the build in ViewTransition, "ready" settles shortly after "updateCallbackDone",
		// i.e. after all pseudo elements are created and the animation is about to start.
		// In simulation mode the "old" animation starts before swap,
		// the "new" animation starts after swap. That is not really comparable.
		// Thus we go with "very, very shortly after updateCallbackDone" and make both equal.
		//
		// "finished" resolves after all animations are done.

		currentTransition.viewTransition = {
			updateCallbackDone: updateDone, // this is about correct
			ready: updateDone, // good enough
			// Finished promise could have been done better: finished rejects iff updateDone does.
			// Our simulation always resolves, never rejects.
			finished: new Promise((r) => (currentTransition.viewTransitionFinished = r as () => void)), // see end of updateDOM
			skipTransition: () => {
				currentTransition.transitionSkipped = true;
				// This cancels all animations of the simulation
				document.documentElement.removeAttribute(OLD_NEW_ATTR);
			},
		};
	}
	// In earlier versions was then'ed on viewTransition.ready which would not execute
	// if the visual part of the transition has errors or was skipped
	currentTransition.viewTransition?.updateCallbackDone.finally(async () => {
		await runScripts();
		onPageLoad();
		announce();
	});
	// finished.ready and finished.finally are the same for the simulation but not
	// necessarily for native view transition, where finished rejects when updateCallbackDone does.
	currentTransition.viewTransition?.finished.finally(() => {
		currentTransition.viewTransition = undefined;
		if (currentTransition === mostRecentTransition) mostRecentTransition = undefined;
		if (currentNavigation === mostRecentNavigation) mostRecentNavigation = undefined;
		document.documentElement.removeAttribute(DIRECTION_ATTR);
		document.documentElement.removeAttribute(OLD_NEW_ATTR);
	});
	try {
		// Compatibility:
		// In an earlier version we awaited viewTransition.ready, which includes animation setup.
		// Scripts that depend on the view transition pseudo elements should hook on viewTransition.ready.
		await currentTransition.viewTransition?.updateCallbackDone;
	} catch (e) {
		// This log doesn't make it worse than before, where we got error messages about uncaught exceptions, which can't be caught when the trigger was a click or history traversal.
		// Needs more investigation on root causes if errors still occur sporadically
		const err = e as Error;
		// biome-ignore lint/suspicious/noConsoleLog: allowed
		console.log('[astro]', err.name, err.message, err.stack);
	}
}

let navigateOnServerWarned = false;

export async function navigate(href: string, options?: Options) {
	if (inBrowser === false) {
		if (!navigateOnServerWarned) {
			// instantiate an error for the stacktrace to show to user.
			const warning = new Error(
				'The view transitions client API was called during a server side render. This may be unintentional as the navigate() function is expected to be called in response to user interactions. Please make sure that your usage is correct.',
			);
			warning.name = 'Warning';
			console.warn(warning);
			navigateOnServerWarned = true;
		}
		return;
	}
	await transition('forward', originalLocation, new URL(href, location.href), options ?? {});
}

function onPopState(ev: PopStateEvent) {
	if (!transitionEnabledOnThisPage() && ev.state) {
		// The current page doesn't have View Transitions enabled
		// but the page we navigate to does (because it set the state).
		// Do a full page refresh to reload the client-side router from the new page.
		location.reload();
		return;
	}

	// History entries without state are created by the browser (e.g. for hash links)
	// Our view transition entries always have state.
	// Just ignore stateless entries.
	// The browser will handle navigation fine without our help
	if (ev.state === null) {
		return;
	}
	const state: State = history.state;
	const nextIndex = state.index;
	const direction: Direction = nextIndex > currentHistoryIndex ? 'forward' : 'back';
	currentHistoryIndex = nextIndex;
	transition(direction, originalLocation, new URL(location.href), {}, state);
}

const onScrollEnd = () => {
	// NOTE: our "popstate" event handler may call `pushState()` or
	// `replaceState()` and then `scrollTo()`, which will fire "scroll" and
	// "scrollend" events. To avoid redundant work and expensive calls to
	// `replaceState()`, we simply check that the values are different before
	// updating.
	if (history.state && (scrollX !== history.state.scrollX || scrollY !== history.state.scrollY)) {
		updateScrollPosition({ scrollX, scrollY });
	}
};

// initialization
if (inBrowser) {
	if (supportsViewTransitions || getFallback() !== 'none') {
		originalLocation = new URL(location.href);
		addEventListener('popstate', onPopState);
		addEventListener('load', onPageLoad);
		// There's not a good way to record scroll position before a history back
		// navigation, so we will record it when the user has stopped scrolling.
		if ('onscrollend' in window) addEventListener('scrollend', onScrollEnd);
		else {
			// Keep track of state between intervals
			let intervalId: number | undefined, lastY: number, lastX: number, lastIndex: State['index'];
			const scrollInterval = () => {
				// Check the index to see if a popstate event was fired
				if (lastIndex !== history.state?.index) {
					clearInterval(intervalId);
					intervalId = undefined;
					return;
				}
				// Check if the user stopped scrolling
				if (lastY === scrollY && lastX === scrollX) {
					// Cancel the interval and update scroll positions
					clearInterval(intervalId);
					intervalId = undefined;
					onScrollEnd();
					return;
				} else {
					// Update vars with current positions
					(lastY = scrollY), (lastX = scrollX);
				}
			};
			// We can't know when or how often scroll events fire, so we'll just use them to start intervals
			addEventListener(
				'scroll',
				() => {
					if (intervalId !== undefined) return;
					(lastIndex = history.state?.index), (lastY = scrollY), (lastX = scrollX);
					intervalId = window.setInterval(scrollInterval, 50);
				},
				{ passive: true },
			);
		}
	}
	for (const script of document.getElementsByTagName('script')) {
		script.dataset.astroExec = '';
	}
}

// Keep all styles that are potentially created by client:only components
// and required on the next page
async function prepareForClientOnlyComponents(
	newDocument: Document,
	toLocation: URL,
	signal: AbortSignal,
) {
	// Any client:only component on the next page?
	if (newDocument.body.querySelector(`astro-island[client='only']`)) {
		// Load the next page with an empty module loader cache
		const nextPage = document.createElement('iframe');
		// with srcdoc resolving imports does not work on webkit browsers
		nextPage.src = toLocation.href;
		nextPage.style.display = 'none';
		document.body.append(nextPage);
		// silence the iframe's console
		// @ts-ignore
		nextPage.contentWindow!.console = Object.keys(console).reduce((acc: any, key) => {
			acc[key] = () => {};
			return acc;
		}, {});
		await hydrationDone(nextPage);

		const nextHead = nextPage.contentDocument?.head;
		if (nextHead) {
			// Collect the vite ids of all styles present in the next head
			const viteIds = [...nextHead.querySelectorAll(`style[${VITE_ID}]`)].map((style) =>
				style.getAttribute(VITE_ID),
			);
			// Copy required styles to the new document if they are from hydration.
			viteIds.forEach((id) => {
				const style = nextHead.querySelector(`style[${VITE_ID}="${id}"]`);
				if (style && !newDocument.head.querySelector(`style[${VITE_ID}="${id}"]`)) {
					newDocument.head.appendChild(style.cloneNode(true));
				}
			});
		}

		// return a promise that resolves when all astro-islands are hydrated
		async function hydrationDone(loadingPage: HTMLIFrameElement) {
			if (!signal.aborted) {
				await new Promise((r) =>
					loadingPage.contentWindow?.addEventListener('load', r, { once: true }),
				);
			}
			return new Promise<void>(async (r) => {
				for (let count = 0; count <= 20; ++count) {
					if (signal.aborted) break;
					if (!loadingPage.contentDocument!.body.querySelector('astro-island[ssr]')) break;
					await new Promise((r2) => setTimeout(r2, 50));
				}
				r();
			});
		}
	}
}

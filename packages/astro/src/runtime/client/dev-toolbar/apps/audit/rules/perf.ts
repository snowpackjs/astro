import type { AuditRuleWithSelector } from './index.js';

// A regular expression to match external URLs
const EXTERNAL_URL_REGEX = /^(?:[a-z+]+:)?\/\//i;

export const perf: AuditRuleWithSelector[] = [
	{
		code: 'perf-use-image-component',
		title: 'Use the Image component',
		message: 'This image could be replaced with the Image component to improve performance.',
		selector: 'img:not([data-image-component])',
		async match(element) {
			const src = element.getAttribute('src');
			if (!src) return false;

			// Don't match data URIs, they're typically used for specific use-cases that the image component doesn't help with
			if (src.startsWith('data:')) return false;

			// Ignore images that are smaller than 20KB, most of the time the image component won't really help with these, or they're used for specific use-cases (pixel tracking, etc.)
			// Ignore this test for remote images for now, fetching them can be very slow and possibly dangerous
			if (!EXTERNAL_URL_REGEX.test(src)) {
				const imageData = await fetch(src).then((response) => response.blob());
				if (imageData.size < 20480) return false;
			}

			return true;
		},
	},
	{
		code: 'perf-use-loading-lazy',
		title: 'Unoptimized loading attribute',
		message: (element) =>
			`This ${element.nodeName} tag is below the fold and could be lazy-loaded to improve performance.`,
		selector:
			'img:not([loading]), img[loading="eager"], iframe:not([loading]), iframe[loading="eager"]',
		match(element) {
			const htmlElement = element as HTMLImageElement | HTMLIFrameElement;

			// Ignore elements that are above the fold, they should be loaded eagerly
			let currentElement = element as HTMLElement;
			let elementYPosition = 0;
			while (currentElement) {
				elementYPosition += currentElement.offsetTop;
				currentElement = currentElement.offsetParent as HTMLElement;
			}
			if (elementYPosition < window.innerHeight) return false;

			// Ignore elements using `data:` URI, the `loading` attribute doesn't do anything for these
			if (htmlElement.src.startsWith('data:')) return false;

			return true;
		},
	},
	{
		code: 'perf-use-loading-eager',
		title: 'Unoptimized loading attribute',
		message: (element) =>
			`This ${element.nodeName} tag is above the fold and could be eagerly-loaded to improve performance.`,
		selector: 'img[loading="lazy"], iframe[loading="lazy"]',
		match(element) {
			const htmlElement = element as HTMLImageElement | HTMLIFrameElement;

			// Ignore elements that are below the fold, they should be loaded lazily
			let currentElement = element as HTMLElement;
			let elementYPosition = 0;
			while (currentElement) {
				elementYPosition += currentElement.offsetTop;
				currentElement = currentElement.offsetParent as HTMLElement;
			}
			if (elementYPosition > window.innerHeight) return false;

			// Ignore elements using `data:` URI, the `loading` attribute doesn't do anything for these
			if (htmlElement.src.startsWith('data:')) return false;

			return true;
		},
	},
	{
		code: 'perf-use-videos',
		title: 'Use videos instead of GIFs for large animations',
		message:
			'This GIF could be replaced with a video to reduce its file size and improve performance.',
		selector: 'img[src$=".gif"]',
		async match(element) {
			const src = element.getAttribute('src');
			if (!src) return false;

			// Ignore remote URLs
			if (EXTERNAL_URL_REGEX.test(src)) return false;

			// Ignore GIFs that are smaller than 100KB, those are typically small enough to not be a problem
			if (!EXTERNAL_URL_REGEX.test(src)) {
				const imageData = await fetch(src).then((response) => response.blob());
				if (imageData.size < 102400) return false;
			}

			return true;
		},
	},
	{
		code: 'perf-slow-component-server-render',
		title: 'Server-rendered component took a long time to render',
		message: (element) =>
			`This component took an unusually long time to render on the server (${getCleanRenderingTime(
				element.getAttribute('server-render-time'),
			)}). This might be a sign that it's doing too much work on the server, or something is blocking rendering.`,
		selector: 'astro-island[server-render-time]',
		match(element) {
			const serverRenderTime = element.getAttribute('server-render-time');
			if (!serverRenderTime) return false;

			const renderingTime = parseFloat(serverRenderTime);
			if (Number.isNaN(renderingTime)) return false;

			return renderingTime > 500;
		},
	},
	{
		code: 'perf-slow-component-client-hydration',
		title: 'Client-rendered component took a long time to hydrate',
		message: (element) =>
			`This component took an unusually long time to render on the server (${getCleanRenderingTime(
				element.getAttribute('client-render-time'),
			)}). This could be a sign that something is blocking the main thread and preventing the component from hydrating quickly.`,
		selector: 'astro-island[client-render-time]',
		match(element) {
			const clientRenderTime = element.getAttribute('client-render-time');
			if (!clientRenderTime) return false;

			const renderingTime = parseFloat(clientRenderTime);
			if (Number.isNaN(renderingTime)) return false;

			return renderingTime > 500;
		},
	},
];

function getCleanRenderingTime(time: string | null) {
	if (!time) return 'unknown';
	const renderingTime = parseFloat(time);
	if (Number.isNaN(renderingTime)) return 'unknown';

	return renderingTime.toFixed(2) + 's';
}

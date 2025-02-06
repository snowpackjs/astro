import type { MiddlewareHandler } from 'astro';

/**
 * Middleware which adds the web vitals `<meta>` tag to each page’s `<head>`.
 *
 * @example
 * <meta name="x-astro-vitals-route" content="/blog/[slug]" />
 */
export const onRequest: MiddlewareHandler = async ({ params, url }, next) => {
	const response = await next();
	const contentType = response.headers.get('Content-Type');
	if (contentType !== 'text/html') return response;
	const webVitalsMetaTag = getMetaTag(url, params);
	return new Response(
		response.body
			?.pipeThrough(new TextDecoderStream())
			.pipeThrough(HeadInjectionTransformStream(webVitalsMetaTag))
			.pipeThrough(new TextEncoderStream()),
		response,
	);
};

/** TransformStream which injects the passed HTML just before the closing </head> tag.  */
function HeadInjectionTransformStream(htmlToInject: string) {
	let hasInjected = false;
	return new TransformStream({
		transform: (chunk, controller) => {
			if (!hasInjected) {
				const headCloseIndex = chunk.indexOf('</head>');
				if (headCloseIndex > -1) {
					chunk = chunk.slice(0, headCloseIndex) + htmlToInject + chunk.slice(headCloseIndex);
					hasInjected = true;
				}
			}
			controller.enqueue(chunk);
		},
	});
}

/** Get a `<meta>` tag to identify the current Astro route. */
function getMetaTag(url: URL, params: Record<string, string | undefined>) {
	let route = url.pathname;
	for (const [key, value] of Object.entries(params)) {
		if (value) route = route.replace(value, `[${key}]`);
	}
	route = miniEncodeAttribute(stripTrailingSlash(route));
	return `<meta name="x-astro-vitals-route" content="${route}" />`;
}

function stripTrailingSlash(str: string) {
	return str.length > 1 && str.at(-1) === '/' ? str.slice(0, -1) : str;
}

function miniEncodeAttribute(str: string) {
	return str
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

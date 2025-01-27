import type { IncomingHttpHeaders } from 'node:http';
import type { Logger } from './logger/core.js';

type HeaderType = Headers | Record<string, any> | IncomingHttpHeaders;

export interface CreateRequestOptions {
	url: URL | string;
	clientAddress?: string | undefined;
	headers: HeaderType;
	method?: string;
	body?: RequestInit['body'];
	logger: Logger;
	locals?: object | undefined;
	/**
	 * Whether the request is being created for a static build or for a prerendered page within a hybrid/SSR build, or for emulating one of those in dev mode.
	 *
	 * When `true`, the request will not include search parameters or body, and warn when headers are accessed.
	 *
	 * @default false
	 */
	isPrerendered?: boolean;

	routePattern: string;

	init?: RequestInit;
}

/**
 * Used by astro internals to create a web standard request object.
 *
 * The user of this function may provide the data in a runtime-agnostic way.
 *
 * This is used by the static build to create fake requests for prerendering, and by the dev server to convert node requests into the standard request object.
 */
export function createRequest({
	url,
	headers,
	method = 'GET',
	body = undefined,
	logger,
	isPrerendered = false,
	routePattern,
	init,
}: CreateRequestOptions): Request {
	// headers are made available on the created request only if the request is for a page that will be on-demand rendered
	const headersObj = isPrerendered
		? undefined
		: headers instanceof Headers
			? headers
			: new Headers(
					// Filter out HTTP/2 pseudo-headers. These are internally-generated headers added to all HTTP/2 requests with trusted metadata about the request.
					// Examples include `:method`, `:scheme`, `:authority`, and `:path`.
					// They are always prefixed with a colon to distinguish them from other headers, and it is an error to add the to a Headers object manually.
					// See https://httpwg.org/specs/rfc7540.html#HttpRequest
					Object.entries(headers as Record<string, any>).filter(([name]) => !name.startsWith(':')),
				);

	if (typeof url === 'string') url = new URL(url);

	// Remove search parameters if the request is for a page that will be on-demand rendered
	if (isPrerendered) {
		url.search = '';
	}

	const request = new Request(url, {
		method: method,
		headers: headersObj,
		// body is made available only if the request is for a page that will be on-demand rendered
		body: isPrerendered ? null : body,
		...init,
	});

	if (isPrerendered) {
		// Warn when accessing headers in SSG mode
		let _headers = request.headers;

		// We need to remove descriptor's value and writable properties because we're adding getters and setters.
		const { value, writable, ...headersDesc } =
			Object.getOwnPropertyDescriptor(request, 'headers') || {};

		Object.defineProperty(request, 'headers', {
			...headersDesc,
			get() {
				logger.warn(
					null,
					`\`Astro.request.headers\` was used when rendering the route \`${routePattern}'\`. \`Astro.request.headers\` is not available on prerendered pages. If you need access to request headers, make sure that the page is server-rendered using \`export const prerender = false;\` or by setting \`output\` to \`"server"\` in your Astro config to make all your pages server-rendered by default.`,
				);
				return _headers;
			},
			set(newHeaders: Headers) {
				_headers = newHeaders;
			},
		});
	}

	return request;
}

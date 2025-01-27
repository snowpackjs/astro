import type { MiddlewareHandler } from '../../types/public/common.js';
import { defineMiddleware } from '../middleware/index.js';

/**
 * Content types that can be passed when sending a request via a form
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/enctype
 * @private
 */
const FORM_CONTENT_TYPES = [
	'application/x-www-form-urlencoded',
	'multipart/form-data',
	'text/plain',
];

/**
 * Returns a middleware function in charge to check the `origin` header.
 *
 * @private
 */
export function createOriginCheckMiddleware(): MiddlewareHandler {
	return defineMiddleware((context, next) => {
		const { request, url, isPrerendered } = context;
		// Prerendered pages should be excluded
		if (isPrerendered) {
			return next();
		}
		if (request.method === 'GET') {
			return next();
		}
		const sameOrigin =
			(request.method === 'POST' ||
				request.method === 'PUT' ||
				request.method === 'PATCH' ||
				request.method === 'DELETE') &&
			request.headers.get('origin') === url.origin;

		const hasContentType = request.headers.has('content-type');
		if (hasContentType) {
			const formLikeHeader = hasFormLikeHeader(request.headers.get('content-type'));
			if (formLikeHeader && !sameOrigin) {
				return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
					status: 403,
				});
			}
		} else {
			if (!sameOrigin) {
				return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
					status: 403,
				});
			}
		}

		return next();
	});
}

function hasFormLikeHeader(contentType: string | null): boolean {
	if (contentType) {
		for (const FORM_CONTENT_TYPE of FORM_CONTENT_TYPES) {
			if (contentType.toLowerCase().includes(FORM_CONTENT_TYPE)) {
				return true;
			}
		}
	}
	return false;
}

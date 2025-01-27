import type {
	MiddlewareHandler,
	MiddlewareNext,
	RewritePayload,
} from '../../types/public/common.js';
import type { APIContext } from '../../types/public/context.js';
import { AstroError, AstroErrorData } from '../errors/index.js';

/**
 * Utility function that is in charge of calling the middleware.
 *
 * It accepts a `R` generic, which usually is the `Response` returned.
 * It is a generic because endpoints can return a different payload.
 *
 * When calling a middleware, we provide a `next` function, this function might or
 * might not be called.
 *
 * A middleware, to behave correctly, can:
 * - return a `Response`;
 * - call `next`;
 *
 * Failing doing so will result an error. A middleware can call `next` and do not return a
 * response. A middleware can not call `next` and return a new `Response` from scratch (maybe with a redirect).
 *
 * ```js
 * const onRequest = async (context, next) => {
 *   const response = await next(context);
 *   return response;
 * }
 * ```
 *
 * ```js
 * const onRequest = async (context, next) => {
 *   context.locals = "foo";
 *   next();
 * }
 * ```
 *
 * @param onRequest The function called which accepts a `context` and a `resolve` function
 * @param apiContext The API context
 * @param responseFunction A callback function that should return a promise with the response
 */
export async function callMiddleware(
	onRequest: MiddlewareHandler,
	apiContext: APIContext,
	responseFunction: (
		apiContext: APIContext,
		rewritePayload?: RewritePayload,
	) => Promise<Response> | Response,
): Promise<Response> {
	let nextCalled = false;
	let responseFunctionPromise: Promise<Response> | Response | undefined = undefined;
	const next: MiddlewareNext = async (payload) => {
		nextCalled = true;
		responseFunctionPromise = responseFunction(apiContext, payload);
		// We need to pass the APIContext pass to `callMiddleware` because it can be mutated across middleware functions
		return responseFunctionPromise;
	};

	let middlewarePromise = onRequest(apiContext, next);

	return await Promise.resolve(middlewarePromise).then(async (value) => {
		// first we check if `next` was called
		if (nextCalled) {
			/**
			 * Then we check if a value is returned. If so, we need to return the value returned by the
			 * middleware.
			 * e.g.
			 * ```js
			 * 	const response = await next();
			 * 	const new Response(null, { status: 500, headers: response.headers });
			 * ```
			 */
			if (typeof value !== 'undefined') {
				if (value instanceof Response === false) {
					throw new AstroError(AstroErrorData.MiddlewareNotAResponse);
				}
				return value;
			} else {
				/**
				 * Here we handle the case where `next` was called and returned nothing.
				 */
				if (responseFunctionPromise) {
					return responseFunctionPromise;
				} else {
					throw new AstroError(AstroErrorData.MiddlewareNotAResponse);
				}
			}
		} else if (typeof value === 'undefined') {
			/**
			 * There might be cases where `next` isn't called and the middleware **must** return
			 * something.
			 *
			 * If not thing is returned, then we raise an Astro error.
			 */
			throw new AstroError(AstroErrorData.MiddlewareNoDataOrNextCalled);
		} else if (value instanceof Response === false) {
			throw new AstroError(AstroErrorData.MiddlewareNotAResponse);
		} else {
			// Middleware did not call resolve and returned a value
			return value;
		}
	});
}

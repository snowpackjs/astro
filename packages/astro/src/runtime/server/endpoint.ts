import type { APIContext, EndpointHandler, Params } from '../../@types/astro';

function getHandlerFromModule(mod: EndpointHandler, method: string) {
	// If there was an exact match on `method`, return that function.
	if (mod[method]) {
		return mod[method];
	}
	// Handle `del` instead of `delete`, since `delete` is a reserved word in JS.
	if (method === 'delete' && mod['del']) {
		return mod['del'];
	}
	// If a single `all` handler was used, return that function.
	if (mod['all']) {
		return mod['all'];
	}
	// Otherwise, no handler found.
	return undefined;
}

/** Renders an endpoint request to completion, returning the body. */
export async function renderEndpoint(
	mod: EndpointHandler,
	request: Request,
	params: Params,
	ssr?: boolean
) {
	const chosenMethod = request.method?.toLowerCase();
	const handler = getHandlerFromModule(mod, chosenMethod);
	if (!ssr && ssr === false && chosenMethod && chosenMethod === 'post') {
		// eslint-disable-next-line no-console
		console.warn(`
post method in API routes without output: 'server' in astro.config.mjs doesn't work. Note that this route will be ignored during the build time.

Update your code to remove this warning.`);
	}
	if (!handler || typeof handler !== 'function') {
		// No handler found, so this should be a 404. Using a custom header
		// to signal to the renderer that this is an internal 404 that should
		// be handled by a custom 404 route if possible.
		let response = new Response(null, {
			status: 404,
			headers: {
				'X-Astro-Response': 'Not-Found',
			},
		});
		return response;
	}

	if (handler.length > 1) {
		// eslint-disable-next-line no-console
		console.warn(`
API routes with 2 arguments have been deprecated. Instead they take a single argument in the form of:

export function get({ params, request }) {
	//...
}

Update your code to remove this warning.`);
	}

	const context = {
		request,
		params,
	};

	const proxy = new Proxy(context, {
		get(target, prop) {
			if (prop in target) {
				return Reflect.get(target, prop);
			} else if (prop in params) {
				// eslint-disable-next-line no-console
				console.warn(`
API routes no longer pass params as the first argument. Instead an object containing a params property is provided in the form of:

export function get({ params }) {
	// ...
}

Update your code to remove this warning.`);
				return Reflect.get(params, prop);
			} else {
				return undefined;
			}
		},
	}) as APIContext & Params;

	return handler.call(mod, proxy, request);
}

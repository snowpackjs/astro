import { bold } from 'kleur/colors';
import { REROUTABLE_STATUS_CODES, REROUTE_DIRECTIVE_HEADER } from '../../core/constants.js';
import { EndpointDidNotReturnAResponse } from '../../core/errors/errors-data.js';
import { AstroError } from '../../core/errors/errors.js';
import type { Logger } from '../../core/logger/core.js';
import type { APIRoute } from '../../types/public/common.js';
import type { APIContext } from '../../types/public/context.js';

/** Renders an endpoint request to completion, returning the body. */
export async function renderEndpoint(
	mod: {
		[method: string]: APIRoute;
	},
	context: APIContext,
	isPrerendered: boolean,
	logger: Logger,
) {
	const { request, url } = context;

	const method = request.method.toUpperCase();
	// use the exact match on `method`, fallback to ALL
	const handler = mod[method] ?? mod['ALL'];
	if (isPrerendered && method !== 'GET') {
		logger.warn(
			'router',
			`${url.pathname} ${bold(
				method,
			)} requests are not available in static endpoints. Mark this page as server-rendered (\`export const prerender = false;\`) or update your config to \`output: 'server'\` to make all your pages server-rendered by default.`,
		);
	}
	if (handler === undefined) {
		logger.warn(
			'router',
			`No API Route handler exists for the method "${method}" for the route "${url.pathname}".\n` +
				`Found handlers: ${Object.keys(mod)
					.map((exp) => JSON.stringify(exp))
					.join(', ')}\n` +
				('all' in mod
					? `One of the exported handlers is "all" (lowercase), did you mean to export 'ALL'?\n`
					: ''),
		);
		// No handler matching the verb found, so this should be a
		// 404. Should be handled by 404.astro route if possible.
		return new Response(null, { status: 404 });
	}
	if (typeof handler !== 'function') {
		logger.error(
			'router',
			`The route "${
				url.pathname
			}" exports a value for the method "${method}", but it is of the type ${typeof handler} instead of a function.`,
		);
		return new Response(null, { status: 500 });
	}

	let response = await handler.call(mod, context);

	if (!response || response instanceof Response === false) {
		throw new AstroError(EndpointDidNotReturnAResponse);
	}

	// Endpoints explicitly returning 404 or 500 response status should
	// NOT be subject to rerouting to 404.astro or 500.astro.
	if (REROUTABLE_STATUS_CODES.includes(response.status)) {
		try {
			response.headers.set(REROUTE_DIRECTIVE_HEADER, 'no');
		} catch (err) {
			// In some cases the response may have immutable headers
			// This is the case if, for example, the user directly returns a `fetch` response
			// There's no clean way to check if the headers are immutable, so we just catch the error
			// Note that response.clone() still has immutable headers!
			if ((err as Error).message?.includes('immutable')) {
				response = new Response(response.body, response);
				response.headers.set(REROUTE_DIRECTIVE_HEADER, 'no');
			} else {
				throw err;
			}
		}
	}

	return response;
}

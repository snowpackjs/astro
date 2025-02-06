// Keep at the top
import './polyfill.js';

import type { Context } from '@netlify/functions';
import type { SSRManifest } from 'astro';
import { App } from 'astro/app';
import { setGetEnv } from 'astro/env/setup';

setGetEnv((key) => process.env[key]);

export interface Args {
	middlewareSecret: string;
}

const clientAddressSymbol = Symbol.for('astro.clientAddress');

export const createExports = (manifest: SSRManifest, { middlewareSecret }: Args) => {
	const app = new App(manifest);

	function createHandler(integrationConfig: {
		cacheOnDemandPages: boolean;
		notFoundContent?: string;
	}) {
		return async function handler(request: Request, context: Context) {
			const routeData = app.match(request);
			if (!routeData && typeof integrationConfig.notFoundContent !== 'undefined') {
				return new Response(integrationConfig.notFoundContent, {
					status: 404,
					headers: { 'Content-Type': 'text/html; charset=utf-8' },
				});
			}

			Reflect.set(request, clientAddressSymbol, context.ip);
			let locals: Record<string, unknown> = {};

			const astroLocalsHeader = request.headers.get('x-astro-locals');
			const middlewareSecretHeader = request.headers.get('x-astro-middleware-secret');
			if (astroLocalsHeader) {
				if (middlewareSecretHeader !== middlewareSecret) {
					return new Response('Forbidden', { status: 403 });
				}
				// hide the secret from the rest of user and library code
				request.headers.delete('x-astro-middleware-secret');
				locals = JSON.parse(astroLocalsHeader);
			}

			locals.netlify = { context };

			const response = await app.render(request, { routeData, locals });

			if (app.setCookieHeaders) {
				for (const setCookieHeader of app.setCookieHeaders(response)) {
					response.headers.append('Set-Cookie', setCookieHeader);
				}
			}

			if (integrationConfig.cacheOnDemandPages) {
				const isCacheableMethod = ['GET', 'HEAD'].includes(request.method);

				// any user-provided Cache-Control headers take precedence
				const hasCacheControl = [
					'Cache-Control',
					'CDN-Cache-Control',
					'Netlify-CDN-Cache-Control',
				].some((header) => response.headers.has(header));

				if (isCacheableMethod && !hasCacheControl) {
					// caches this page for up to a year
					response.headers.append('CDN-Cache-Control', 'public, max-age=31536000, must-revalidate');
				}
			}

			return response;
		};
	}

	return { default: createHandler };
};

import { App } from 'astro/app';

 export function createExports(manifest) {
 	const app = new App(manifest);

 	const fetch = async (
 		request,
 		env,
 		context
 	) => {
 		const { pathname } = new URL(request.url);

 		// static assets fallback, in case default _routes.json is not used
 		if (manifest.assets.has(pathname)) {
 			return env.ASSETS.fetch(request.url.replace(/\.html$/, ''));
 		}

 		const routeData = app.match(request);
 		if (!routeData) {
 			// https://developers.cloudflare.com/pages/functions/api-reference/#envassetsfetch
 			const asset = await env.ASSETS.fetch(
 				request.url.replace(/index.html$/, '').replace(/\.html$/, '')
 			);
 			if (asset.status !== 404) {
 				return asset;
 			}
 		}

 		Reflect.set(
 			request,
 			Symbol.for('astro.clientAddress'),
 			request.headers.get('cf-connecting-ip')
 		);

 		process.env.ASTRO_STUDIO_APP_TOKEN ??= (() => {
 			if (typeof env.ASTRO_STUDIO_APP_TOKEN === 'string') {
 				return env.ASTRO_STUDIO_APP_TOKEN;
 			}
 		})();

 		const locals = {
 			runtime: {
 				env: env,
 				cf: request.cf,
 				caches,
 				ctx: {
 					waitUntil: (promise) => context.waitUntil(promise),
 					passThroughOnException: () => context.passThroughOnException(),
 				},
 			},
 		};

 		const response = await app.render(request, { routeData, locals });

 		if (app.setCookieHeaders) {
 			for (const setCookieHeader of app.setCookieHeaders(response)) {
 				response.headers.append('Set-Cookie', setCookieHeader);
 			}
 		}

 		return response;
 	};

 	return { default: { fetch } };
 }
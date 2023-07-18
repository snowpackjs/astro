import mime from 'mime';
import type http from 'node:http';
import type { ComponentInstance, ManifestData, RouteData, SSRManifest } from '../@types/astro';
import { attachToResponse } from '../core/cookies/index.js';
import { call as callEndpoint } from '../core/endpoint/dev/index.js';
import { throwIfRedirectNotAllowed } from '../core/endpoint/index.js';
import { AstroErrorData, isAstroError } from '../core/errors/index.js';
import { warn } from '../core/logger/core.js';
import { loadMiddleware } from '../core/middleware/loadMiddleware.js';
import type { DevelopmentEnvironment, SSROptions } from '../core/render/dev/index';
import { preload, renderPage } from '../core/render/dev/index.js';
import { getParamsAndProps } from '../core/render/index.js';
import { createRequest } from '../core/request.js';
import { matchAllRoutes } from '../core/routing/index.js';
import { getSortedPreloadedMatches } from '../prerender/routing.js';
import { isServerLikeOutput } from '../prerender/utils.js';
import { log404 } from './common.js';
import { handle404Response, writeSSRResult, writeWebResponse } from './response.js';

const clientLocalsSymbol = Symbol.for('astro.locals');

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
	...args: any
) => Promise<infer R>
	? R
	: any;

export interface MatchedRoute {
	route: RouteData;
	filePath: URL;
	resolvedPathname: string;
	preloadedComponent: ComponentInstance;
	mod: ComponentInstance;
}

function getCustom404Route(manifest: ManifestData): RouteData | undefined {
	const route404 = /^\/404\/?$/;
	return manifest.routes.find((r) => route404.test(r.route));
}

export async function matchRoute(
	pathname: string,
	env: DevelopmentEnvironment,
	manifest: ManifestData
): Promise<MatchedRoute | undefined> {
	const { logging, settings, routeCache } = env;
	const matches = matchAllRoutes(pathname, manifest);
	const preloadedMatches = await getSortedPreloadedMatches({ env, matches, settings });

	for await (const { preloadedComponent, route: maybeRoute, filePath } of preloadedMatches) {
		// attempt to get static paths
		// if this fails, we have a bad URL match!
		try {
			await getParamsAndProps({
				mod: preloadedComponent,
				route: maybeRoute,
				routeCache,
				pathname: pathname,
				logging,
				ssr: isServerLikeOutput(settings.config),
			});
			return {
				route: maybeRoute,
				filePath,
				resolvedPathname: pathname,
				preloadedComponent,
				mod: preloadedComponent,
			};
		} catch (e) {
			// Ignore error for no matching static paths
			if (isAstroError(e) && e.title === AstroErrorData.NoMatchingStaticPathFound.title) {
				continue;
			}
			throw e;
		}
	}

	// Try without `.html` extensions or `index.html` in request URLs to mimic
	// routing behavior in production builds. This supports both file and directory
	// build formats, and is necessary based on how the manifest tracks build targets.
	const altPathname = pathname.replace(/(index)?\.html$/, '');
	if (altPathname !== pathname) {
		return await matchRoute(altPathname, env, manifest);
	}

	if (matches.length) {
		const possibleRoutes = matches.flatMap((route) => route.component);

		warn(
			logging,
			'getStaticPaths',
			`${AstroErrorData.NoMatchingStaticPathFound.message(
				pathname
			)}\n\n${AstroErrorData.NoMatchingStaticPathFound.hint(possibleRoutes)}`
		);
	}

	log404(logging, pathname);
	const custom404 = getCustom404Route(manifest);

	if (custom404) {
		const filePath = new URL(`./${custom404.component}`, settings.config.root);
		const preloadedComponent = await preload({ env, filePath });

		return {
			route: custom404,
			filePath,
			resolvedPathname: pathname,
			preloadedComponent,
			mod: preloadedComponent,
		};
	}

	return undefined;
}

type HandleRoute = {
	matchedRoute: AsyncReturnType<typeof matchRoute>;
	url: URL;
	pathname: string;
	status: number;
	body: ArrayBuffer | undefined;
	origin: string;
	env: DevelopmentEnvironment;
	manifestData: ManifestData;
	incomingRequest: http.IncomingMessage;
	incomingResponse: http.ServerResponse;
	manifest: SSRManifest;
};

export async function handleRoute({
	matchedRoute,
	url,
	pathname,
	status,
	body,
	origin,
	env,
	manifestData,
	incomingRequest,
	incomingResponse,
	manifest,
}: HandleRoute): Promise<void> {
	const { logging, settings } = env;
	if (!matchedRoute) {
		return handle404Response(origin, incomingRequest, incomingResponse);
	}

	if (matchedRoute.route.type === 'redirect' && !settings.config.experimental.redirects) {
		writeWebResponse(
			incomingResponse,
			new Response(`To enable redirect set experimental.redirects to \`true\`.`, {
				status: 400,
			})
		);
		return;
	}

	const { config } = settings;
	const filePath: URL | undefined = matchedRoute.filePath;
	const { route, preloadedComponent } = matchedRoute;
	const buildingToSSR = isServerLikeOutput(config);

	// Headers are only available when using SSR.
	const request = createRequest({
		url,
		headers: buildingToSSR ? incomingRequest.headers : new Headers(),
		method: incomingRequest.method,
		body,
		logging,
		ssr: buildingToSSR,
		clientAddress: buildingToSSR ? incomingRequest.socket.remoteAddress : undefined,
		locals: Reflect.get(incomingRequest, clientLocalsSymbol), // Allows adapters to pass in locals in dev mode.
	});

	// Set user specified headers to response object.
	for (const [name, value] of Object.entries(config.server.headers ?? {})) {
		if (value) incomingResponse.setHeader(name, value);
	}

	const options: SSROptions = {
		env,
		filePath,
		preload: preloadedComponent,
		pathname,
		request,
		route,
	};
	const middleware = await loadMiddleware(env.loader, env.settings.config.srcDir);
	if (middleware) {
		options.middleware = middleware;
	}
	// Route successfully matched! Render it.
	if (route.type === 'endpoint') {
		const result = await callEndpoint(options);
		if (result.type === 'response') {
			if (result.response.headers.get('X-Astro-Response') === 'Not-Found') {
				const fourOhFourRoute = await matchRoute('/404', env, manifestData);
				return handleRoute({
					matchedRoute: fourOhFourRoute,
					url: new URL('/404', url),
					pathname: '/404',
					status: 404,
					body,
					origin,
					env,
					manifestData,
					incomingRequest,
					incomingResponse,
					manifest,
				});
			}
			throwIfRedirectNotAllowed(result.response, config);
			await writeWebResponse(incomingResponse, result.response);
		} else {
			let contentType = 'text/plain';
			// Dynamic routes don't include `route.pathname`, so synthesize a path for these (e.g. 'src/pages/[slug].svg')
			const filepath =
				route.pathname ||
				route.segments.map((segment) => segment.map((p) => p.content).join('')).join('/');
			const computedMimeType = mime.getType(filepath);
			if (computedMimeType) {
				contentType = computedMimeType;
			}
			const response = new Response(Buffer.from(result.body, result.encoding), {
				status: 200,
				headers: {
					'Content-Type': `${contentType};charset=utf-8`,
				},
			});
			attachToResponse(response, result.cookies);
			await writeWebResponse(incomingResponse, response);
		}
	} else {
		const result = await renderPage(options);
		if (result.status === 404) {
			const fourOhFourRoute = await matchRoute('/404', env, manifestData);
			return handleRoute({
				...options,
				matchedRoute: fourOhFourRoute,
				url: new URL(pathname, url),
				status: 404,
				body,
				origin,
				env,
				manifestData,
				incomingRequest,
				incomingResponse,
				manifest,
			});
		}
		throwIfRedirectNotAllowed(result, config);

		let response = result;
		// Response.status is read-only, so a clone is required to override
		if (response.status !== status) {
			response = new Response(result.body, { ...result, status });
		}
		return await writeSSRResult(request, response, incomingResponse);
	}
}

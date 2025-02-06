import type { ComponentInstance } from '../../types/astro.js';
import type { Params, Props } from '../../types/public/common.js';
import type { RouteData } from '../../types/public/internal.js';
import { DEFAULT_404_COMPONENT } from '../constants.js';
import { AstroError, AstroErrorData } from '../errors/index.js';
import type { Logger } from '../logger/core.js';
import { routeIsFallback } from '../redirects/helpers.js';
import { routeIsRedirect } from '../redirects/index.js';
import type { RouteCache } from './route-cache.js';
import { callGetStaticPaths, findPathItemByKey } from './route-cache.js';

interface GetParamsAndPropsOptions {
	mod: ComponentInstance | undefined;
	routeData?: RouteData | undefined;
	routeCache: RouteCache;
	pathname: string;
	logger: Logger;
	serverLike: boolean;
	base: string;
}

export async function getProps(opts: GetParamsAndPropsOptions): Promise<Props> {
	const { logger, mod, routeData: route, routeCache, pathname, serverLike, base } = opts;

	// If there's no route, or if there's a pathname (e.g. a static `src/pages/normal.astro` file),
	// then we know for sure they don't have params and props, return a fallback value.
	if (!route || route.pathname) {
		return {};
	}

	if (
		routeIsRedirect(route) ||
		routeIsFallback(route) ||
		route.component === DEFAULT_404_COMPONENT
	) {
		return {};
	}

	// During build, the route cache should already be populated.
	// During development, the route cache is filled on-demand and may be empty.
	const staticPaths = await callGetStaticPaths({
		mod,
		route,
		routeCache,
		logger,
		ssr: serverLike,
		base,
	});

	// The pathname used here comes from the server, which already encoded.
	// Since we decided to not mess up with encoding anymore, we need to decode them back so the parameters can match
	// the ones expected from the users
	const params = getParams(route, pathname);
	const matchedStaticPath = findPathItemByKey(staticPaths, params, route, logger);
	if (!matchedStaticPath && (serverLike ? route.prerender : true)) {
		throw new AstroError({
			...AstroErrorData.NoMatchingStaticPathFound,
			message: AstroErrorData.NoMatchingStaticPathFound.message(pathname),
			hint: AstroErrorData.NoMatchingStaticPathFound.hint([route.component]),
		});
	}

	if (mod) {
		validatePrerenderEndpointCollision(route, mod, params);
	}

	const props: Props = matchedStaticPath?.props ? { ...matchedStaticPath.props } : {};

	return props;
}

/**
 * When given a route with the pattern `/[x]/[y]/[z]/svelte`, and a pathname `/a/b/c/svelte`,
 * returns the params object: { x: "a", y: "b", z: "c" }.
 */
export function getParams(route: RouteData, pathname: string): Params {
	if (!route.params.length) return {};
	// The RegExp pattern expects a decoded string, but the pathname is encoded
	// when the URL contains non-English characters.
	const paramsMatch =
		route.pattern.exec(pathname) ||
		route.fallbackRoutes
			.map((fallbackRoute) => fallbackRoute.pattern.exec(pathname))
			.find((x) => x);
	if (!paramsMatch) return {};
	const params: Params = {};
	route.params.forEach((key, i) => {
		if (key.startsWith('...')) {
			params[key.slice(3)] = paramsMatch[i + 1] ? paramsMatch[i + 1] : undefined;
		} else {
			params[key] = paramsMatch[i + 1];
		}
	});
	return params;
}

/**
 * If we have an endpoint at `src/pages/api/[slug].ts` that's prerendered, and the `slug`
 * is `undefined`, throw an error as we can't generate the `/api` file and `/api` directory
 * at the same time. Using something like `[slug].json.ts` instead will work.
 */
function validatePrerenderEndpointCollision(
	route: RouteData,
	mod: ComponentInstance,
	params: Params,
) {
	if (route.type === 'endpoint' && mod.getStaticPaths) {
		const lastSegment = route.segments[route.segments.length - 1];
		const paramValues = Object.values(params);
		const lastParam = paramValues[paramValues.length - 1];
		// Check last segment is solely `[slug]` or `[...slug]` case (dynamic). Make sure it's not
		// `foo[slug].js` by checking segment length === 1. Also check here if that param is undefined.
		if (lastSegment.length === 1 && lastSegment[0].dynamic && lastParam === undefined) {
			throw new AstroError({
				...AstroErrorData.PrerenderDynamicEndpointPathCollide,
				message: AstroErrorData.PrerenderDynamicEndpointPathCollide.message(route.route),
				hint: AstroErrorData.PrerenderDynamicEndpointPathCollide.hint(route.component),
				location: {
					file: route.component,
				},
			});
		}
	}
}

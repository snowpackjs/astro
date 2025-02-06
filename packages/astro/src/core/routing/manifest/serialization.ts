import type { SerializedRouteData } from '../../../types/astro.js';
import type { AstroConfig } from '../../../types/public/config.js';
import type { RouteData } from '../../../types/public/internal.js';

import { getRouteGenerator } from './generator.js';

export function serializeRouteData(
	routeData: RouteData,
	trailingSlash: AstroConfig['trailingSlash'],
): SerializedRouteData {
	return {
		...routeData,
		generate: undefined,
		pattern: routeData.pattern.source,
		redirectRoute: routeData.redirectRoute
			? serializeRouteData(routeData.redirectRoute, trailingSlash)
			: undefined,
		fallbackRoutes: routeData.fallbackRoutes.map((fallbackRoute) => {
			return serializeRouteData(fallbackRoute, trailingSlash);
		}),
		_meta: { trailingSlash },
	};
}

export function deserializeRouteData(rawRouteData: SerializedRouteData): RouteData {
	return {
		route: rawRouteData.route,
		type: rawRouteData.type,
		pattern: new RegExp(rawRouteData.pattern),
		params: rawRouteData.params,
		component: rawRouteData.component,
		generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
		pathname: rawRouteData.pathname || undefined,
		segments: rawRouteData.segments,
		prerender: rawRouteData.prerender,
		redirect: rawRouteData.redirect,
		redirectRoute: rawRouteData.redirectRoute
			? deserializeRouteData(rawRouteData.redirectRoute)
			: undefined,
		fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
			return deserializeRouteData(fallback);
		}),
		isIndex: rawRouteData.isIndex,
		origin: rawRouteData.origin,
	};
}

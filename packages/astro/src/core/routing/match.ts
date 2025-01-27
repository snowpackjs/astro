import type { ManifestData } from '../../types/astro.js';
import type { RouteData } from '../../types/public/internal.js';

/** Find matching route from pathname */
export function matchRoute(pathname: string, manifest: ManifestData): RouteData | undefined {
	const decodedPathname = decodeURI(pathname);
	return manifest.routes.find((route) => {
		return (
			route.pattern.test(decodedPathname) ||
			route.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(decodedPathname))
		);
	});
}

/** Finds all matching routes from pathname */
export function matchAllRoutes(pathname: string, manifest: ManifestData): RouteData[] {
	return manifest.routes.filter((route) => route.pattern.test(decodeURI(pathname)));
}

const ROUTE404_RE = /^\/404\/?$/;
const ROUTE500_RE = /^\/500\/?$/;

export function isRoute404(route: string) {
	return ROUTE404_RE.test(route);
}

export function isRoute500(route: string) {
	return ROUTE500_RE.test(route);
}

/**
 * Determines if the given route matches a 404 or 500 error page.
 *
 * @param {RouteData} route - The route data to check.
 * @returns {boolean} `true` if the route matches a 404 or 500 error page, otherwise `false`.
 */
export function isRoute404or500(route: RouteData): boolean {
	return isRoute404(route.route) || isRoute500(route.route);
}

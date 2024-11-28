import type { ManifestData, RouteData } from '../../@types/astro.js';

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
export function matchAllRoutesOrFallback(pathname: string, manifest: ManifestData): RouteData[] {
	const decodedPathname = decodeURI(pathname);
	return manifest.routes.filter((route) => {
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

/**
 * Determines if the given route matches a 404 or 500 error page.
 *
 * @param {RouteData} route - The route data to check.
 * @returns {boolean} `true` if the route matches a 404 or 500 error page, otherwise `false`.
 */
export function isRoute404or500(route: RouteData): boolean {
	return route.pattern.test('/404') || route.pattern.test('/500');
}

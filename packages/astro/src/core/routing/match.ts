import type { RoutesList } from '../../types/astro.js';
import type { RouteData } from '../../types/public/internal.js';
import { redirectIsExternal } from '../redirects/render.js';
import { SERVER_ISLAND_BASE_PREFIX, SERVER_ISLAND_COMPONENT } from '../server-islands/endpoint.js';

/** Find matching route from pathname */
export function matchRoute(pathname: string, manifest: RoutesList): RouteData | undefined {
	const decodedPathname = decodeURI(pathname);
	return manifest.routes.find((route) => {
		return (
			route.pattern.test(decodedPathname) ||
			route.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(decodedPathname))
		);
	});
}

/** Finds all matching routes from pathname */
export function matchAllRoutes(pathname: string, manifest: RoutesList): RouteData[] {
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

/**
 * Determines if a given route is associated with the server island component.
 *
 * @param {RouteData} route - The route data object to evaluate.
 * @return {boolean} Returns true if the route's component is the server island component, otherwise false.
 */
export function isRouteServerIsland(route: RouteData): boolean {
	return route.component === SERVER_ISLAND_COMPONENT;
}

/**
 * Determines whether the given `Request` is targeted to a "server island" based on its URL.
 *
 * @param {Request} request - The request object to be evaluated.
 * @param {string} [base=''] - The base path provided via configuration.
 * @return {boolean} - Returns `true` if the request is for a server island, otherwise `false`.
 */
export function isRequestServerIsland(request: Request, base = ''): boolean {
	const url = new URL(request.url);
	const pathname = url.pathname.slice(base.length);

	return pathname.startsWith(SERVER_ISLAND_BASE_PREFIX);
}

/**
 * Checks if the given request corresponds to a 404 or 500 route based on the specified base path.
 *
 * @param {Request} request - The HTTP request object to be checked.
 * @param {string} [base=''] - The base path to trim from the request's URL before checking the route. Default is an empty string.
 * @return {boolean} Returns true if the request matches a 404 or 500 route; otherwise, returns false.
 */
export function requestIs404Or500(request: Request, base = '') {
	const url = new URL(request.url);
	const pathname = url.pathname.slice(base.length);

	return isRoute404(pathname) || isRoute500(pathname);
}

/**
 * Determines whether a given route is an external redirect.
 *
 * @param {RouteData} route - The route object to check.
 * @return {boolean} Returns true if the route is an external redirect, otherwise false.
 */
export function isRouteExternalRedirect(route: RouteData): boolean {
	return !!(route.type === 'redirect' && route.redirect && redirectIsExternal(route.redirect));
}

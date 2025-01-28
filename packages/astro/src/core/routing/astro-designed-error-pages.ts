import notFoundTemplate from '../../template/4xx.js';
import type { ComponentInstance, RoutesList } from '../../types/astro.js';
import type { RouteData } from '../../types/public/internal.js';
import { DEFAULT_404_COMPONENT, DEFAULT_500_COMPONENT } from '../constants.js';

export const DEFAULT_404_ROUTE: RouteData = {
	component: DEFAULT_404_COMPONENT,
	generate: () => '',
	params: [],
	pattern: /\/404/,
	prerender: false,
	pathname: '/404',
	segments: [[{ content: '404', dynamic: false, spread: false }]],
	type: 'page',
	route: '/404',
	fallbackRoutes: [],
	isIndex: false,
	origin: 'internal',
};

export const DEFAULT_500_ROUTE: RouteData = {
	component: DEFAULT_500_COMPONENT,
	generate: () => '',
	params: [],
	pattern: /\/500/,
	prerender: false,
	pathname: '/500',
	segments: [[{ content: '500', dynamic: false, spread: false }]],
	type: 'page',
	route: '/500',
	fallbackRoutes: [],
	isIndex: false,
	origin: 'internal',
};

export function ensure404Route(manifest: RoutesList) {
	if (!manifest.routes.some((route) => route.route === '/404')) {
		manifest.routes.push(DEFAULT_404_ROUTE);
	}
	return manifest;
}

async function default404Page({ pathname }: { pathname: string }) {
	return new Response(
		notFoundTemplate({
			statusCode: 404,
			title: 'Not found',
			tabTitle: '404: Not Found',
			pathname,
		}),
		{ status: 404, headers: { 'Content-Type': 'text/html' } },
	);
}
// mark the function as an AstroComponentFactory for the rendering internals
default404Page.isAstroComponentFactory = true;

export const default404Instance: ComponentInstance = {
	default: default404Page,
};

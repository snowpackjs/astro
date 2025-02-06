import { posix } from 'node:path';
import type {
	AstroConfig,
	HookParameters,
	IntegrationResolvedRoute,
	ValidRedirectStatus,
} from 'astro';
import { Redirects } from './redirects.js';

const pathJoin = posix.join;

function getRedirectStatus(route: IntegrationResolvedRoute): ValidRedirectStatus {
	if (typeof route.redirect === 'object') {
		return route.redirect.status;
	}
	return 301;
}

interface CreateRedirectsFromAstroRoutesParams {
	config: Pick<AstroConfig, 'build' | 'output' | 'base'>;
	/**
	 * Maps a `RouteData` to a dynamic target
	 */
	routeToDynamicTargetMap: Map<IntegrationResolvedRoute, string>;
	dir: URL;
	buildOutput: 'static' | 'server';
	assets: HookParameters<'astro:build:done'>['assets'];
}

/**
 * Takes a set of routes and creates a Redirects object from them.
 */
export function createRedirectsFromAstroRoutes({
	config,
	routeToDynamicTargetMap,
	dir,
	buildOutput,
	assets,
}: CreateRedirectsFromAstroRoutesParams): Redirects {
	const base =
		config.base && config.base !== '/'
			? config.base.endsWith('/')
				? config.base.slice(0, -1)
				: config.base
			: '';
	const redirects = new Redirects();

	for (const [route, dynamicTarget = ''] of routeToDynamicTargetMap) {
		const distURL = assets.get(route.pattern);
		// A route with a `pathname` is as static route.
		if (route.pathname) {
			if (route.redirect) {
				// A redirect route without dynamic parts. Get the redirect status
				// from the user if provided.
				redirects.add({
					dynamic: false,
					input: `${base}${route.pathname}`,
					target: typeof route.redirect === 'object' ? route.redirect.destination : route.redirect,
					status: getRedirectStatus(route),
					weight: 2,
				});
				continue;
			}

			// If this is a static build we don't want to add redirects to the HTML file.
			if (buildOutput === 'static') {
				continue;
			}

			if (distURL) {
				redirects.add({
					dynamic: false,
					input: `${base}${route.pathname}`,
					target: prependForwardSlash(distURL.toString().replace(dir.toString(), '')),
					status: 200,
					weight: 2,
				});
			} else {
				redirects.add({
					dynamic: false,
					input: `${base}${route.pathname}`,
					target: dynamicTarget,
					status: 200,
					weight: 2,
				});

				if (route.pattern === '/404') {
					redirects.add({
						dynamic: true,
						input: '/*',
						target: dynamicTarget,
						status: 404,
						weight: 0,
					});
				}
			}
		} else {
			// This is the dynamic route code. This generates a pattern from a dynamic
			// route formatted with *s in place of the Astro dynamic/spread syntax.
			const pattern = generateDynamicPattern(route);

			// This route was prerendered and should be forwarded to the HTML file.
			if (distURL) {
				const targetRoute = route.redirectRoute ?? route;
				let target = generateDynamicPattern(targetRoute);
				if (config.build.format === 'directory') {
					target = pathJoin(target, 'index.html');
				} else {
					target += '.html';
				}
				redirects.add({
					dynamic: true,
					input: `${base}${pattern}`,
					target,
					status: route.type === 'redirect' ? 301 : 200,
					weight: 1,
				});
			} else {
				redirects.add({
					dynamic: true,
					input: `${base}${pattern}`,
					target: dynamicTarget,
					status: 200,
					weight: 1,
				});
			}
		}
	}

	return redirects;
}

/**
 * Converts an Astro dynamic route into one formatted like:
 * /team/articles/*
 * With stars replacing spread and :id syntax replacing [id]
 */
function generateDynamicPattern(route: IntegrationResolvedRoute) {
	return (
		'/' +
		route.segments
			.map(([part]) => {
				//(part.dynamic ? '*' : part.content)
				if (part.dynamic) {
					if (part.spread) {
						return '*';
					} else {
						return ':' + part.content;
					}
				} else {
					return part.content;
				}
			})
			.join('/')
	);
}

function prependForwardSlash(str: string) {
	return str.startsWith('/') ? str : '/' + str;
}

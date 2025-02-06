import type { AstroSettings, RoutesList } from '../../../types/astro.js';
import type { Logger } from '../../logger/core.js';

import nodeFs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bold } from 'kleur/colors';
import pLimit from 'p-limit';
import { injectImageEndpoint } from '../../../assets/endpoint/config.js';
import { toRoutingStrategy } from '../../../i18n/utils.js';
import { runHookRoutesResolved } from '../../../integrations/hooks.js';
import { getPrerenderDefault } from '../../../prerender/utils.js';
import type { AstroConfig } from '../../../types/public/config.js';
import type { RouteData, RoutePart } from '../../../types/public/internal.js';
import { SUPPORTED_MARKDOWN_FILE_EXTENSIONS } from '../../constants.js';
import {
	MissingIndexForInternationalization,
	UnsupportedExternalRedirect,
} from '../../errors/errors-data.js';
import { AstroError } from '../../errors/index.js';
import { hasFileExtension, removeLeadingForwardSlash, slash } from '../../path.js';
import { injectServerIslandRoute } from '../../server-islands/endpoint.js';
import { resolvePages } from '../../util.js';
import { ensure404Route } from '../astro-designed-error-pages.js';
import { routeComparator } from '../priority.js';
import { getRouteGenerator } from './generator.js';
import { getPattern } from './pattern.js';
import { getRoutePrerenderOption } from './prerender.js';
import { validateSegment } from './segment.js';

const require = createRequire(import.meta.url);

interface Item {
	basename: string;
	ext: string;
	parts: RoutePart[];
	file: string;
	isDir: boolean;
	isIndex: boolean;
	isPage: boolean;
	routeSuffix: string;
}

// Disable eslint as we're not sure how to improve this regex yet
// eslint-disable-next-line regexp/no-super-linear-backtracking
const ROUTE_DYNAMIC_SPLIT = /\[(.+?\(.+?\)|.+?)\]/;
const ROUTE_SPREAD = /^\.{3}.+$/;

export function getParts(part: string, file: string) {
	const result: RoutePart[] = [];
	part.split(ROUTE_DYNAMIC_SPLIT).map((str, i) => {
		if (!str) return;
		const dynamic = i % 2 === 1;

		const [, content] = dynamic ? /([^(]+)$/.exec(str) || [null, null] : [null, str];

		if (!content || (dynamic && !/^(?:\.\.\.)?[\w$]+$/.test(content))) {
			throw new Error(`Invalid route ${file} — parameter name must match /^[a-zA-Z0-9_$]+$/`);
		}

		result.push({
			content,
			dynamic,
			spread: dynamic && ROUTE_SPREAD.test(content),
		});
	});

	return result;
}
/**
 * Checks whether two route segments are semantically equivalent.
 *
 * Two segments are equivalent if they would match the same paths. This happens when:
 * - They have the same length.
 * - Each part in the same position is either:
 *   - Both static and with the same content (e.g. `/foo` and `/foo`).
 *   - Both dynamic, regardless of the content (e.g. `/[bar]` and `/[baz]`).
 *   - Both rest parameters, regardless of the content (e.g. `/[...bar]` and `/[...baz]`).
 */
function isSemanticallyEqualSegment(segmentA: RoutePart[], segmentB: RoutePart[]) {
	if (segmentA.length !== segmentB.length) {
		return false;
	}

	for (const [index, partA] of segmentA.entries()) {
		// Safe to use the index of one segment for the other because the segments have the same length
		const partB = segmentB[index];

		if (partA.dynamic !== partB.dynamic || partA.spread !== partB.spread) {
			return false;
		}

		// Only compare the content on non-dynamic segments
		// `/[bar]` and `/[baz]` are effectively the same route,
		// only bound to a different path parameter.
		if (!partA.dynamic && partA.content !== partB.content) {
			return false;
		}
	}

	return true;
}

export interface CreateRouteManifestParams {
	/** Astro Settings object */
	settings: AstroSettings;
	/** Current working directory */
	cwd?: string;
	/** fs module, for testing */
	fsMod?: typeof nodeFs;
}

function createFileBasedRoutes(
	{ settings, cwd, fsMod }: CreateRouteManifestParams,
	logger: Logger,
): RouteData[] {
	const components: string[] = [];
	const routes: RouteData[] = [];
	const validPageExtensions = new Set<string>([
		'.astro',
		...SUPPORTED_MARKDOWN_FILE_EXTENSIONS,
		...settings.pageExtensions,
	]);
	const validEndpointExtensions = new Set<string>(['.js', '.ts']);
	const localFs = fsMod ?? nodeFs;
	const prerender = getPrerenderDefault(settings.config);

	function walk(
		fs: typeof nodeFs,
		dir: string,
		parentSegments: RoutePart[][],
		parentParams: string[],
	) {
		let items: Item[] = [];
		const files = fs.readdirSync(dir);
		for (const basename of files) {
			const resolved = path.join(dir, basename);
			const file = slash(path.relative(cwd || fileURLToPath(settings.config.root), resolved));
			const isDir = fs.statSync(resolved).isDirectory();

			const ext = path.extname(basename);
			const name = ext ? basename.slice(0, -ext.length) : basename;
			if (name[0] === '_') {
				continue;
			}
			if (basename[0] === '.' && basename !== '.well-known') {
				continue;
			}
			// filter out "foo.astro_tmp" files, etc
			if (!isDir && !validPageExtensions.has(ext) && !validEndpointExtensions.has(ext)) {
				logger.warn(
					null,
					`Unsupported file type ${bold(
						resolved,
					)} found. Prefix filename with an underscore (\`_\`) to ignore.`,
				);

				continue;
			}
			const segment = isDir ? basename : name;
			validateSegment(segment, file);

			const parts = getParts(segment, file);
			const isIndex = isDir ? false : basename.substring(0, basename.lastIndexOf('.')) === 'index';
			const routeSuffix = basename.slice(basename.indexOf('.'), -ext.length);
			const isPage = validPageExtensions.has(ext);

			items.push({
				basename,
				ext,
				parts,
				file: file.replace(/\\/g, '/'),
				isDir,
				isIndex,
				isPage,
				routeSuffix,
			});
		}

		for (const item of items) {
			const segments = parentSegments.slice();

			if (item.isIndex) {
				if (item.routeSuffix) {
					if (segments.length > 0) {
						const lastSegment = segments[segments.length - 1].slice();
						const lastPart = lastSegment[lastSegment.length - 1];

						if (lastPart.dynamic) {
							lastSegment.push({
								dynamic: false,
								spread: false,
								content: item.routeSuffix,
							});
						} else {
							lastSegment[lastSegment.length - 1] = {
								dynamic: false,
								spread: false,
								content: `${lastPart.content}${item.routeSuffix}`,
							};
						}

						segments[segments.length - 1] = lastSegment;
					} else {
						segments.push(item.parts);
					}
				}
			} else {
				segments.push(item.parts);
			}

			const params = parentParams.slice();
			params.push(...item.parts.filter((p) => p.dynamic).map((p) => p.content));

			if (item.isDir) {
				walk(fsMod ?? fs, path.join(dir, item.basename), segments, params);
			} else {
				components.push(item.file);
				const component = item.file;
				const pathname = segments.every((segment) => segment.length === 1 && !segment[0].dynamic)
					? `/${segments.map((segment) => segment[0].content).join('/')}`
					: null;
				const trailingSlash = trailingSlashForPath(pathname, settings.config);
				const pattern = getPattern(segments, settings.config.base, trailingSlash);
				const generate = getRouteGenerator(segments, trailingSlash);
				const route = joinSegments(segments);
				routes.push({
					route,
					isIndex: item.isIndex,
					type: item.isPage ? 'page' : 'endpoint',
					pattern,
					segments,
					params,
					component,
					generate,
					pathname: pathname || undefined,
					prerender,
					fallbackRoutes: [],
					distURL: [],
					origin: 'project',
				});
			}
		}
	}

	const { config } = settings;
	const pages = resolvePages(config);

	if (localFs.existsSync(pages)) {
		walk(localFs, fileURLToPath(pages), [], []);
	} else if (settings.injectedRoutes.length === 0) {
		const pagesDirRootRelative = pages.href.slice(settings.config.root.href.length);
		logger.warn(null, `Missing pages directory: ${pagesDirRootRelative}`);
	}

	return routes;
}

// Get trailing slash rule for a path, based on the config and whether the path has an extension.
// TODO: in Astro 6, change endpoints with extentions to use 'never'
const trailingSlashForPath = (
	pathname: string | null,
	config: AstroConfig,
): AstroConfig['trailingSlash'] =>
	pathname && hasFileExtension(pathname) ? 'ignore' : config.trailingSlash;

function createInjectedRoutes({ settings, cwd }: CreateRouteManifestParams): RouteData[] {
	const { config } = settings;
	const prerender = getPrerenderDefault(config);

	const routes: RouteData[] = [];

	for (const injectedRoute of settings.injectedRoutes) {
		const { pattern: name, entrypoint, prerender: prerenderInjected, origin } = injectedRoute;
		const { resolved, component } = resolveInjectedRoute(entrypoint.toString(), config.root, cwd);

		const segments = removeLeadingForwardSlash(name)
			.split(path.posix.sep)
			.filter(Boolean)
			.map((s: string) => {
				validateSegment(s);
				return getParts(s, component);
			});

		const type = resolved.endsWith('.astro') ? 'page' : 'endpoint';
		const pathname = segments.every((segment) => segment.length === 1 && !segment[0].dynamic)
			? `/${segments.map((segment) => segment[0].content).join('/')}`
			: null;

		const trailingSlash = trailingSlashForPath(pathname, config);
		const pattern = getPattern(segments, settings.config.base, trailingSlash);
		const generate = getRouteGenerator(segments, trailingSlash);
		const params = segments
			.flat()
			.filter((p) => p.dynamic)
			.map((p) => p.content);
		const route = joinSegments(segments);

		routes.push({
			type,
			// For backwards compatibility, an injected route is never considered an index route.
			isIndex: false,
			route,
			pattern,
			segments,
			params,
			component,
			generate,
			pathname: pathname || void 0,
			prerender: prerenderInjected ?? prerender,
			fallbackRoutes: [],
			distURL: [],
			origin,
		});
	}

	return routes;
}

/**
 * Create route data for all configured redirects.
 */
function createRedirectRoutes(
	{ settings }: CreateRouteManifestParams,
	routeMap: Map<string, RouteData>,
): RouteData[] {
	const { config } = settings;
	const trailingSlash = config.trailingSlash;

	const routes: RouteData[] = [];

	for (const [from, to] of Object.entries(settings.config.redirects)) {
		const segments = removeLeadingForwardSlash(from)
			.split(path.posix.sep)
			.filter(Boolean)
			.map((s: string) => {
				validateSegment(s);
				return getParts(s, from);
			});

		const pattern = getPattern(segments, settings.config.base, trailingSlash);
		const generate = getRouteGenerator(segments, trailingSlash);
		const pathname = segments.every((segment) => segment.length === 1 && !segment[0].dynamic)
			? `/${segments.map((segment) => segment[0].content).join('/')}`
			: null;
		const params = segments
			.flat()
			.filter((p) => p.dynamic)
			.map((p) => p.content);
		const route = joinSegments(segments);

		let destination: string;
		if (typeof to === 'string') {
			destination = to;
		} else {
			destination = to.destination;
		}

		// URLs that don't start with leading slash should be considered external
		if (!destination.startsWith('/')) {
			// check if the link starts with http or https; if not, log a warning
			if (!/^https?:\/\//.test(destination) && !URL.canParse(destination)) {
				throw new AstroError(UnsupportedExternalRedirect);
			}
		}

		routes.push({
			type: 'redirect',
			// For backwards compatibility, a redirect is never considered an index route.
			isIndex: false,
			route,
			pattern,
			segments,
			params,
			component: from,
			generate,
			pathname: pathname || void 0,
			prerender: false,
			redirect: to,
			redirectRoute: routeMap.get(destination),
			fallbackRoutes: [],
			distURL: [],
			origin: 'project',
		});
	}

	return routes;
}

/**
 * Checks whether a route segment is static.
 */
function isStaticSegment(segment: RoutePart[]) {
	return segment.every((part) => !part.dynamic && !part.spread);
}

/**
 * Check whether two are sure to collide in clearly unintended ways report appropriately.
 *
 * Fallback routes are never considered to collide with any other route.
 * Routes that may collide depending on the parameters returned by their `getStaticPaths`
 * are not reported as collisions at this stage.
 *
 * Two routes are guaranteed to collide in the following scenarios:
 * - Both are the exact same static route.
 * 	 For example, `/foo` from an injected route and `/foo` from a file in the project.
 * - Both are non-prerendered dynamic routes with equal static parts in matching positions
 *   and dynamic parts of same type in the same positions.
 *   For example, `/foo/[bar]` and `/foo/[baz]` or `/foo/[...bar]` and `/foo/[...baz]`
 *     but not `/foo/[bar]` and `/foo/[...baz]`.
 */
function detectRouteCollision(a: RouteData, b: RouteData, _config: AstroConfig, logger: Logger) {
	if (a.type === 'fallback' || b.type === 'fallback') {
		// If either route is a fallback route, they don't collide.
		// Fallbacks are always added below other routes exactly to avoid collisions.
		return;
	}

	if (
		a.route === b.route &&
		a.segments.every(isStaticSegment) &&
		b.segments.every(isStaticSegment)
	) {
		// If both routes are the same and completely static they are guaranteed to collide
		// such that one of them will never be matched.
		logger.warn(
			'router',
			`The route "${a.route}" is defined in both "${a.component}" and "${b.component}". A static route cannot be defined more than once.`,
		);
		logger.warn(
			'router',
			'A collision will result in an hard error in following versions of Astro.',
		);
		return;
	}

	if (a.prerender || b.prerender) {
		// If either route is prerendered, it is impossible to know if they collide
		// at this stage because it depends on the parameters returned by `getStaticPaths`.
		return;
	}

	if (a.segments.length !== b.segments.length) {
		// If the routes have different number of segments, they cannot perfectly overlap
		// each other, so a collision is either not guaranteed or may be intentional.
		return;
	}

	// Routes have the same number of segments, can use either.
	const segmentCount = a.segments.length;

	for (let index = 0; index < segmentCount; index++) {
		const segmentA = a.segments[index];
		const segmentB = b.segments[index];

		if (!isSemanticallyEqualSegment(segmentA, segmentB)) {
			// If any segment is not semantically equal between the routes
			// it is not certain that the routes collide.
			return;
		}
	}

	// Both routes are guaranteed to collide such that one will never be matched.
	logger.warn(
		'router',
		`The route "${a.route}" is defined in both "${a.component}" and "${b.component}" using SSR mode. A dynamic SSR route cannot be defined more than once.`,
	);
	logger.warn('router', 'A collision will result in an hard error in following versions of Astro.');
}

/** Create manifest of all static routes */
export async function createRoutesList(
	params: CreateRouteManifestParams,
	logger: Logger,
	{ dev = false }: { dev?: boolean } = {},
): Promise<RoutesList> {
	const { settings } = params;
	const { config } = settings;
	// Create a map of all routes so redirects can refer to any route
	const routeMap = new Map();

	const fileBasedRoutes = createFileBasedRoutes(params, logger);
	for (const route of fileBasedRoutes) {
		routeMap.set(route.route, route);
	}

	const injectedRoutes = createInjectedRoutes(params);
	for (const route of injectedRoutes) {
		routeMap.set(route.route, route);
	}

	const redirectRoutes = createRedirectRoutes(params, routeMap);

	// we remove the file based routes that were deemed redirects
	const filteredFiledBasedRoutes = fileBasedRoutes.filter((fileBasedRoute) => {
		const isRedirect = redirectRoutes.findIndex((rd) => rd.route === fileBasedRoute.route);
		return isRedirect < 0;
	});

	const routes: RouteData[] = [
		...[...filteredFiledBasedRoutes, ...injectedRoutes, ...redirectRoutes].sort(routeComparator),
	];

	settings.buildOutput = getPrerenderDefault(config) ? 'static' : 'server';

	// Check the prerender option for each route
	const limit = pLimit(10);
	let promises = [];
	for (const route of routes) {
		promises.push(
			limit(async () => {
				if (route.type !== 'page' && route.type !== 'endpoint') return;
				const localFs = params.fsMod ?? nodeFs;
				const content = await localFs.promises.readFile(
					fileURLToPath(new URL(route.component, settings.config.root)),
					'utf-8',
				);

				await getRoutePrerenderOption(content, route, settings, logger);
			}),
		);
	}
	await Promise.all(promises);

	// Report route collisions
	for (const [index, higherRoute] of routes.entries()) {
		for (const lowerRoute of routes.slice(index + 1)) {
			detectRouteCollision(higherRoute, lowerRoute, config, logger);
		}
	}

	const i18n = settings.config.i18n;
	if (i18n) {
		const strategy = toRoutingStrategy(i18n.routing, i18n.domains);
		// First we check if the user doesn't have an index page.
		if (strategy === 'pathname-prefix-always') {
			let index = routes.find((route) => route.route === '/');
			if (!index) {
				let relativePath = path.relative(
					fileURLToPath(settings.config.root),
					fileURLToPath(new URL('pages', settings.config.srcDir)),
				);
				throw new AstroError({
					...MissingIndexForInternationalization,
					message: MissingIndexForInternationalization.message(i18n.defaultLocale),
					hint: MissingIndexForInternationalization.hint(relativePath),
				});
			}
		}

		// In this block of code we group routes based on their locale

		// A map like: locale => RouteData[]
		const routesByLocale = new Map<string, RouteData[]>();
		// This type is here only as a helper. We copy the routes and make them unique, so we don't "process" the same route twice.
		// The assumption is that a route in the file system belongs to only one locale.
		const setRoutes = new Set(routes.filter((route) => route.type === 'page'));

		// First loop
		// We loop over the locales minus the default locale and add only the routes that contain `/<locale>`.
		const filteredLocales = i18n.locales
			.filter((loc) => {
				if (typeof loc === 'string') {
					return loc !== i18n.defaultLocale;
				}
				return loc.path !== i18n.defaultLocale;
			})
			.map((locale) => {
				if (typeof locale === 'string') {
					return locale;
				}
				return locale.path;
			});
		for (const locale of filteredLocales) {
			for (const route of setRoutes) {
				if (!route.route.includes(`/${locale}`)) {
					continue;
				}
				const currentRoutes = routesByLocale.get(locale);
				if (currentRoutes) {
					currentRoutes.push(route);
					routesByLocale.set(locale, currentRoutes);
				} else {
					routesByLocale.set(locale, [route]);
				}
				setRoutes.delete(route);
			}
		}

		// we loop over the remaining routes and add them to the default locale
		for (const route of setRoutes) {
			const currentRoutes = routesByLocale.get(i18n.defaultLocale);
			if (currentRoutes) {
				currentRoutes.push(route);
				routesByLocale.set(i18n.defaultLocale, currentRoutes);
			} else {
				routesByLocale.set(i18n.defaultLocale, [route]);
			}
			setRoutes.delete(route);
		}

		// Work done, now we start creating "fallback" routes based on the configuration

		if (strategy === 'pathname-prefix-always') {
			// we attempt to retrieve the index page of the default locale
			const defaultLocaleRoutes = routesByLocale.get(i18n.defaultLocale);
			if (defaultLocaleRoutes) {
				// The index for the default locale will be either already at the root path
				// or at the root of the locale.
				const indexDefaultRoute =
					defaultLocaleRoutes.find(({ route }) => route === '/') ??
					defaultLocaleRoutes.find(({ route }) => route === `/${i18n.defaultLocale}`);

				if (indexDefaultRoute) {
					// we found the index of the default locale, now we create a root index that will redirect to the index of the default locale
					const pathname = '/';
					const route = '/';

					const segments = removeLeadingForwardSlash(route)
						.split(path.posix.sep)
						.filter(Boolean)
						.map((s: string) => {
							validateSegment(s);
							return getParts(s, route);
						});

					routes.push({
						...indexDefaultRoute,
						pathname,
						route,
						segments,
						pattern: getPattern(segments, config.base, config.trailingSlash),
						type: 'fallback',
					});
				}
			}
		}

		if (i18n.fallback) {
			let fallback = Object.entries(i18n.fallback);

			if (fallback.length > 0) {
				for (const [fallbackFromLocale, fallbackToLocale] of fallback) {
					let fallbackToRoutes;
					if (fallbackToLocale === i18n.defaultLocale) {
						fallbackToRoutes = routesByLocale.get(i18n.defaultLocale);
					} else {
						fallbackToRoutes = routesByLocale.get(fallbackToLocale);
					}
					const fallbackFromRoutes = routesByLocale.get(fallbackFromLocale);

					// Technically, we should always have a fallback to. Added this to make TS happy.
					if (!fallbackToRoutes) {
						continue;
					}

					for (const fallbackToRoute of fallbackToRoutes) {
						const hasRoute =
							fallbackFromRoutes &&
							// we check if the fallback from locale (the origin) has already this route
							fallbackFromRoutes.some((route) => {
								if (fallbackToLocale === i18n.defaultLocale) {
									return (
										route.route.replace(`/${fallbackFromLocale}`, '') === fallbackToRoute.route
									);
								} else {
									return (
										route.route.replace(`/${fallbackToLocale}`, `/${fallbackFromLocale}`) ===
										fallbackToRoute.route
									);
								}
							});

						if (!hasRoute) {
							let pathname: string | undefined;
							let route: string;
							if (
								fallbackToLocale === i18n.defaultLocale &&
								strategy === 'pathname-prefix-other-locales'
							) {
								if (fallbackToRoute.pathname) {
									pathname = `/${fallbackFromLocale}${fallbackToRoute.pathname}`;
								}
								route = `/${fallbackFromLocale}${fallbackToRoute.route}`;
							} else {
								pathname = fallbackToRoute.pathname
									?.replace(`/${fallbackToLocale}/`, `/${fallbackFromLocale}/`)
									.replace(`/${fallbackToLocale}`, `/${fallbackFromLocale}`);
								route = fallbackToRoute.route
									.replace(`/${fallbackToLocale}`, `/${fallbackFromLocale}`)
									.replace(`/${fallbackToLocale}/`, `/${fallbackFromLocale}/`);
							}
							const segments = removeLeadingForwardSlash(route)
								.split(path.posix.sep)
								.filter(Boolean)
								.map((s: string) => {
									validateSegment(s);
									return getParts(s, route);
								});
							const generate = getRouteGenerator(segments, config.trailingSlash);
							const index = routes.findIndex((r) => r === fallbackToRoute);
							if (index >= 0) {
								const fallbackRoute: RouteData = {
									...fallbackToRoute,
									pathname,
									route,
									segments,
									generate,
									pattern: getPattern(segments, config.base, config.trailingSlash),
									type: 'fallback',
									fallbackRoutes: [],
								};
								const routeData = routes[index];
								routeData.fallbackRoutes.push(fallbackRoute);
							}
						}
					}
				}
			}
		}
	}

	if (dev) {
		// In SSR, a 404 route is injected in the App directly for some special handling,
		// it must not appear in the manifest
		ensure404Route({ routes });
	}
	if (dev || settings.buildOutput === 'server') {
		injectImageEndpoint(settings, { routes }, dev ? 'dev' : 'build');
	}

	// If an adapter is added, we unconditionally inject the server islands route.
	// Ideally we would only inject the server islands route if server islands are used in the project.
	// Unfortunately, there is a "circular dependency": to know if server islands are used, we need to run
	// the build but the build relies on the routes manifest.
	if (dev || settings.config.adapter) {
		injectServerIslandRoute(settings.config, { routes });
	}
	await runHookRoutesResolved({ routes, settings, logger });

	return {
		routes,
	};
}

export function resolveInjectedRoute(entrypoint: string, root: URL, cwd?: string) {
	let resolved;
	try {
		resolved = require.resolve(entrypoint, { paths: [cwd || fileURLToPath(root)] });
	} catch {
		resolved = fileURLToPath(new URL(entrypoint, root));
	}

	return {
		resolved: resolved,
		component: slash(path.relative(cwd || fileURLToPath(root), resolved)),
	};
}

function joinSegments(segments: RoutePart[][]): string {
	const arr = segments.map((segment) => {
		return segment.map((rp) => (rp.dynamic ? `[${rp.content}]` : rp.content)).join('');
	});

	return `/${arr.join('/')}`.toLowerCase();
}

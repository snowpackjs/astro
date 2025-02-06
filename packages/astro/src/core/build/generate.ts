import fs from 'node:fs';
import os from 'node:os';
import { bgGreen, black, blue, bold, dim, green, magenta, red, yellow } from 'kleur/colors';
import PLimit from 'p-limit';
import PQueue from 'p-queue';
import {
	generateImagesForPath,
	getStaticImageList,
	prepareAssetsGenerationEnv,
} from '../../assets/build/generate.js';
import { type BuildInternals, hasPrerenderedPages } from '../../core/build/internal.js';
import {
	isRelativePath,
	joinPaths,
	removeLeadingForwardSlash,
	removeTrailingForwardSlash,
} from '../../core/path.js';
import { toFallbackType, toRoutingStrategy } from '../../i18n/utils.js';
import { runHookBuildGenerated } from '../../integrations/hooks.js';
import { getOutputDirectory } from '../../prerender/utils.js';
import type { AstroSettings, ComponentInstance } from '../../types/astro.js';
import type { GetStaticPathsItem, MiddlewareHandler } from '../../types/public/common.js';
import type { AstroConfig } from '../../types/public/config.js';
import type {
	RouteData,
	RouteType,
	SSRError,
	SSRLoadedRenderer,
} from '../../types/public/internal.js';
import type { SSRManifest, SSRManifestI18n } from '../app/types.js';
import { NoPrerenderedRoutesWithDomains } from '../errors/errors-data.js';
import { AstroError, AstroErrorData } from '../errors/index.js';
import { NOOP_MIDDLEWARE_FN } from '../middleware/noop-middleware.js';
import { getRedirectLocationOrThrow, routeIsRedirect } from '../redirects/index.js';
import { RenderContext } from '../render-context.js';
import { callGetStaticPaths } from '../render/route-cache.js';
import { createRequest } from '../request.js';
import { redirectTemplate } from '../routing/3xx.js';
import { matchRoute } from '../routing/match.js';
import { stringifyParams } from '../routing/params.js';
import { getOutputFilename } from '../util.js';
import { getOutFile, getOutFolder } from './common.js';
import { cssOrder, mergeInlineCss } from './internal.js';
import { BuildPipeline } from './pipeline.js';
import type {
	PageBuildData,
	SinglePageBuiltModule,
	StaticBuildOptions,
	StylesheetAsset,
} from './types.js';
import { getTimeStat, shouldAppendForwardSlash } from './util.js';

export async function generatePages(options: StaticBuildOptions, internals: BuildInternals) {
	const generatePagesTimer = performance.now();
	const ssr = options.settings.buildOutput === 'server';
	let manifest: SSRManifest;
	if (ssr) {
		manifest = await BuildPipeline.retrieveManifest(options.settings, internals);
	} else {
		const baseDirectory = getOutputDirectory(options.settings);
		const renderersEntryUrl = new URL('renderers.mjs', baseDirectory);
		const renderers = await import(renderersEntryUrl.toString());
		const middleware: MiddlewareHandler = internals.middlewareEntryPoint
			? await import(internals.middlewareEntryPoint.toString()).then((mod) => mod.onRequest)
			: NOOP_MIDDLEWARE_FN;
		manifest = createBuildManifest(
			options.settings,
			internals,
			renderers.renderers as SSRLoadedRenderer[],
			middleware,
			options.key,
		);
	}
	const pipeline = BuildPipeline.create({ internals, manifest, options });
	const { config, logger } = pipeline;

	// HACK! `astro:assets` relies on a global to know if its running in dev, prod, ssr, ssg, full moon
	// If we don't delete it here, it's technically not impossible (albeit improbable) for it to leak
	if (ssr && !hasPrerenderedPages(internals)) {
		delete globalThis?.astroAsset?.addStaticImage;
	}

	const verb = ssr ? 'prerendering' : 'generating';
	logger.info('SKIP_FORMAT', `\n${bgGreen(black(` ${verb} static routes `))}`);
	const builtPaths = new Set<string>();
	const pagesToGenerate = pipeline.retrieveRoutesToGenerate();
	if (ssr) {
		for (const [pageData, filePath] of pagesToGenerate) {
			if (pageData.route.prerender) {
				// i18n domains won't work with pre rendered routes at the moment, so we need to throw an error
				if (config.i18n?.domains && Object.keys(config.i18n.domains).length > 0) {
					throw new AstroError({
						...NoPrerenderedRoutesWithDomains,
						message: NoPrerenderedRoutesWithDomains.message(pageData.component),
					});
				}

				const ssrEntryPage = await pipeline.retrieveSsrEntry(pageData.route, filePath);

				const ssrEntry = ssrEntryPage as SinglePageBuiltModule;
				await generatePage(pageData, ssrEntry, builtPaths, pipeline);
			}
		}
	} else {
		for (const [pageData, filePath] of pagesToGenerate) {
			const entry = await pipeline.retrieveSsrEntry(pageData.route, filePath);
			await generatePage(pageData, entry, builtPaths, pipeline);
		}
	}
	logger.info(
		null,
		green(`✓ Completed in ${getTimeStat(generatePagesTimer, performance.now())}.\n`),
	);

	const staticImageList = getStaticImageList();
	if (staticImageList.size) {
		logger.info('SKIP_FORMAT', `${bgGreen(black(` generating optimized images `))}`);

		const totalCount = Array.from(staticImageList.values())
			.map((x) => x.transforms.size)
			.reduce((a, b) => a + b, 0);
		const cpuCount = os.cpus().length;
		const assetsCreationPipeline = await prepareAssetsGenerationEnv(pipeline, totalCount);
		const queue = new PQueue({ concurrency: Math.max(cpuCount, 1) });

		const assetsTimer = performance.now();
		for (const [originalPath, transforms] of staticImageList) {
			// Process each source image in parallel based on the queue’s concurrency
			// (`cpuCount`). Process each transform for a source image sequentially.
			//
			// # Design Decision:
			// We have 3 source images (A.png, B.png, C.png) and 3 transforms for
			// each:
			// ```
			// A1.png A2.png A3.png
			// B1.png B2.png B3.png
			// C1.png C2.png C3.png
			// ```
			//
			// ## Option 1
			// Enqueue all transforms indiscriminantly
			// ```
			// |_A1.png   |_B2.png   |_C1.png
			// |_B3.png   |_A2.png   |_C3.png
			// |_C2.png   |_A3.png   |_B1.png
			// ```
			// * Advantage: Maximum parallelism, saturate CPU
			// * Disadvantage: Spike in context switching
			//
			// ## Option 2
			// Enqueue all transforms, but constrain processing order by source image
			// ```
			// |_A3.png   |_B1.png   |_C2.png
			// |_A1.png   |_B3.png   |_C1.png
			// |_A2.png   |_B2.png   |_C3.png
			// ```
			// * Advantage: Maximum parallelism, saturate CPU (same as Option 1) in
			//   hope to avoid context switching
			// * Disadvantage: Context switching still occurs and performance still
			//   suffers
			//
			// ## Option 3
			// Enqueue each source image, but perform the transforms for that source
			// image sequentially
			// ```
			// \_A1.png   \_B1.png   \_C1.png
			//  \_A2.png   \_B2.png   \_C2.png
			//   \_A3.png   \_B3.png   \_C3.png
			// ```
			// * Advantage: Less context switching
			// * Disadvantage: If you have a low number of source images with high
			//   number of transforms then this is suboptimal.
			//
			// ## BEST OPTION:
			// **Option 3**. Most projects will have a higher number of source images
			// with a few transforms on each. Even though Option 2 should be faster
			// and _should_ prevent context switching, this was not observed in
			// nascent tests. Context switching was high and the overall performance
			// was half of Option 3.
			//
			// If looking to optimize further, please consider the following:
			// * Avoid `queue.add()` in an async for loop. Notice the `await
			//   queue.onIdle();` after this loop. We do not want to create a scenario
			//   where tasks are added to the queue after the queue.onIdle() resolves.
			//   This can break tests and create annoying race conditions.
			// * Exposing a concurrency property in `astro.config.mjs` to allow users
			//   to override Node’s os.cpus().length default.
			// * Create a proper performance benchmark for asset transformations of
			//   projects in varying sizes of source images and transforms.
			queue
				.add(() => generateImagesForPath(originalPath, transforms, assetsCreationPipeline))
				.catch((e) => {
					throw e;
				});
		}

		await queue.onIdle();
		const assetsTimeEnd = performance.now();
		logger.info(null, green(`✓ Completed in ${getTimeStat(assetsTimer, assetsTimeEnd)}.\n`));

		delete globalThis?.astroAsset?.addStaticImage;
	}

	await runHookBuildGenerated({ settings: options.settings, logger });
}

const THRESHOLD_SLOW_RENDER_TIME_MS = 500;

async function generatePage(
	pageData: PageBuildData,
	ssrEntry: SinglePageBuiltModule,
	builtPaths: Set<string>,
	pipeline: BuildPipeline,
) {
	// prepare information we need
	const { config, logger } = pipeline;
	const pageModulePromise = ssrEntry.page;

	// Calculate information of the page, like scripts, links and styles
	const styles = pageData.styles
		.sort(cssOrder)
		.map(({ sheet }) => sheet)
		.reduce(mergeInlineCss, []);
	// may be used in the future for handling rel=modulepreload, rel=icon, rel=manifest etc.
	const linkIds: [] = [];
	if (!pageModulePromise) {
		throw new Error(
			`Unable to find the module for ${pageData.component}. This is unexpected and likely a bug in Astro, please report.`,
		);
	}
	const pageModule = await pageModulePromise();
	const generationOptions: Readonly<GeneratePathOptions> = {
		pageData,
		linkIds,
		scripts: null,
		styles,
		mod: pageModule,
	};

	async function generatePathWithLogs(
		path: string,
		route: RouteData,
		index: number,
		paths: string[],
		isConcurrent: boolean,
	) {
		const timeStart = performance.now();
		pipeline.logger.debug('build', `Generating: ${path}`);

		const filePath = getOutputFilename(config, path, pageData.route);
		const lineIcon =
			(index === paths.length - 1 && !isConcurrent) || paths.length === 1 ? '└─' : '├─';

		// Log the rendering path first if not concurrent. We'll later append the time taken to render.
		// We skip if it's concurrent as the logs may overlap
		if (!isConcurrent) {
			logger.info(null, `  ${blue(lineIcon)} ${dim(filePath)}`, false);
		}

		const created = await generatePath(path, pipeline, generationOptions, route);

		const timeEnd = performance.now();
		const isSlow = timeEnd - timeStart > THRESHOLD_SLOW_RENDER_TIME_MS;
		const timeIncrease = (isSlow ? red : dim)(`(+${getTimeStat(timeStart, timeEnd)})`);
		const notCreated =
			created === false ? yellow('(file not created, response body was empty)') : '';

		if (isConcurrent) {
			logger.info(null, `  ${blue(lineIcon)} ${dim(filePath)} ${timeIncrease} ${notCreated}`);
		} else {
			logger.info('SKIP_FORMAT', ` ${timeIncrease} ${notCreated}`);
		}
	}

	// Now we explode the routes. A route render itself, and it can render its fallbacks (i18n routing)
	for (const route of eachRouteInRouteData(pageData)) {
		const icon =
			route.type === 'page' || route.type === 'redirect' || route.type === 'fallback'
				? green('▶')
				: magenta('λ');
		logger.info(null, `${icon} ${getPrettyRouteName(route)}`);

		// Get paths for the route, calling getStaticPaths if needed.
		const paths = await getPathsForRoute(route, pageModule, pipeline, builtPaths);

		// Generate each paths
		if (config.build.concurrency > 1) {
			const limit = PLimit(config.build.concurrency);
			const promises: Promise<void>[] = [];
			for (let i = 0; i < paths.length; i++) {
				const path = paths[i];
				promises.push(limit(() => generatePathWithLogs(path, route, i, paths, true)));
			}
			await Promise.allSettled(promises);
		} else {
			for (let i = 0; i < paths.length; i++) {
				const path = paths[i];
				await generatePathWithLogs(path, route, i, paths, false);
			}
		}
	}
}

function* eachRouteInRouteData(data: PageBuildData) {
	yield data.route;
	for (const fallbackRoute of data.route.fallbackRoutes) {
		yield fallbackRoute;
	}
}

async function getPathsForRoute(
	route: RouteData,
	mod: ComponentInstance,
	pipeline: BuildPipeline,
	builtPaths: Set<string>,
): Promise<Array<string>> {
	const { logger, options, routeCache, serverLike, config } = pipeline;
	let paths: Array<string> = [];
	if (route.pathname) {
		paths.push(route.pathname);
		builtPaths.add(removeTrailingForwardSlash(route.pathname));
	} else {
		const staticPaths = await callGetStaticPaths({
			mod,
			route,
			routeCache,
			logger,
			ssr: serverLike,
			base: config.base,
		}).catch((err) => {
			logger.error('build', `Failed to call getStaticPaths for ${route.component}`);
			throw err;
		});

		const label = staticPaths.length === 1 ? 'page' : 'pages';
		logger.debug(
			'build',
			`├── ${bold(green('√'))} ${route.component} → ${magenta(`[${staticPaths.length} ${label}]`)}`,
		);

		paths = staticPaths
			.map((staticPath) => {
				try {
					return stringifyParams(staticPath.params, route);
				} catch (e) {
					if (e instanceof TypeError) {
						throw getInvalidRouteSegmentError(e, route, staticPath);
					}
					throw e;
				}
			})
			.filter((staticPath) => {
				// The path hasn't been built yet, include it
				if (!builtPaths.has(removeTrailingForwardSlash(staticPath))) {
					return true;
				}

				// The path was already built once. Check the manifest to see if
				// this route takes priority for the final URL.
				// NOTE: The same URL may match multiple routes in the manifest.
				// Routing priority needs to be verified here for any duplicate
				// paths to ensure routing priority rules are enforced in the final build.
				const matchedRoute = matchRoute(staticPath, options.routesList);
				return matchedRoute === route;
			});

		// Add each path to the builtPaths set, to avoid building it again later.
		for (const staticPath of paths) {
			builtPaths.add(removeTrailingForwardSlash(staticPath));
		}
	}

	return paths;
}

function getInvalidRouteSegmentError(
	e: TypeError,
	route: RouteData,
	staticPath: GetStaticPathsItem,
): AstroError {
	const invalidParam = /^Expected "([^"]+)"/.exec(e.message)?.[1];
	const received = invalidParam ? staticPath.params[invalidParam] : undefined;
	let hint =
		'Learn about dynamic routes at https://docs.astro.build/en/core-concepts/routing/#dynamic-routes';
	if (invalidParam && typeof received === 'string') {
		const matchingSegment = route.segments.find(
			(segment) => segment[0]?.content === invalidParam,
		)?.[0];
		const mightBeMissingSpread = matchingSegment?.dynamic && !matchingSegment?.spread;
		if (mightBeMissingSpread) {
			hint = `If the param contains slashes, try using a rest parameter: **[...${invalidParam}]**. Learn more at https://docs.astro.build/en/core-concepts/routing/#dynamic-routes`;
		}
	}
	return new AstroError({
		...AstroErrorData.InvalidDynamicRoute,
		message: invalidParam
			? AstroErrorData.InvalidDynamicRoute.message(
					route.route,
					JSON.stringify(invalidParam),
					JSON.stringify(received),
				)
			: `Generated path for ${route.route} is invalid.`,
		hint,
	});
}

function addPageName(pathname: string, opts: StaticBuildOptions): void {
	const trailingSlash = opts.settings.config.trailingSlash;
	const buildFormat = opts.settings.config.build.format;
	const pageName = shouldAppendForwardSlash(trailingSlash, buildFormat)
		? pathname.replace(/\/?$/, '/').replace(/^\//, '')
		: pathname.replace(/^\//, '');
	opts.pageNames.push(pageName);
}

function getUrlForPath(
	pathname: string,
	base: string,
	origin: string,
	format: AstroConfig['build']['format'],
	trailingSlash: AstroConfig['trailingSlash'],
	routeType: RouteType,
): URL {
	/**
	 * Examples:
	 * pathname: /, /foo
	 * base: /
	 */

	let ending: string;
	switch (format) {
		case 'directory':
		case 'preserve': {
			ending = trailingSlash === 'never' ? '' : '/';
			break;
		}
		case 'file':
		default: {
			ending = '.html';
			break;
		}
	}
	let buildPathname: string;
	if (pathname === '/' || pathname === '') {
		buildPathname = base;
	} else if (routeType === 'endpoint') {
		const buildPathRelative = removeLeadingForwardSlash(pathname);
		buildPathname = joinPaths(base, buildPathRelative);
	} else {
		const buildPathRelative =
			removeTrailingForwardSlash(removeLeadingForwardSlash(pathname)) + ending;
		buildPathname = joinPaths(base, buildPathRelative);
	}
	const url = new URL(buildPathname, origin);
	return url;
}

interface GeneratePathOptions {
	pageData: PageBuildData;
	linkIds: string[];
	scripts: { type: 'inline' | 'external'; value: string } | null;
	styles: StylesheetAsset[];
	mod: ComponentInstance;
}

/**
 *
 * @param pathname
 * @param pipeline
 * @param gopts
 * @param route
 * @return {Promise<boolean | undefined>} If `false` the file hasn't been created. If `undefined` it's expected to not be created.
 */
async function generatePath(
	pathname: string,
	pipeline: BuildPipeline,
	gopts: GeneratePathOptions,
	route: RouteData,
): Promise<boolean | undefined> {
	const { mod } = gopts;
	const { config, logger, options } = pipeline;
	logger.debug('build', `Generating: ${pathname}`);

	// This adds the page name to the array so it can be shown as part of stats.
	if (route.type === 'page') {
		addPageName(pathname, options);
	}

	// Do not render the fallback route if there is already a translated page
	// with the same path
	if (
		route.type === 'fallback' &&
		// If route is index page, continue rendering. The index page should
		// always be rendered
		route.pathname !== '/' &&
		// Check if there is a translated page with the same path
		Object.values(options.allPages).some((val) => val.route.pattern.test(pathname))
	) {
		return undefined;
	}

	const url = getUrlForPath(
		pathname,
		config.base,
		options.origin,
		config.build.format,
		config.trailingSlash,
		route.type,
	);

	const request = createRequest({
		url,
		headers: new Headers(),
		logger,
		isPrerendered: true,
		routePattern: route.component,
	});
	const renderContext = await RenderContext.create({
		pipeline,
		pathname: pathname,
		request,
		routeData: route,
		clientAddress: undefined,
	});

	let body: string | Uint8Array;
	let response: Response;
	try {
		response = await renderContext.render(mod);
	} catch (err) {
		if (!AstroError.is(err) && !(err as SSRError).id && typeof err === 'object') {
			(err as SSRError).id = route.component;
		}
		throw err;
	}

	if (response.status >= 300 && response.status < 400) {
		// Adapters may handle redirects themselves, turning off Astro's redirect handling using `config.build.redirects` in the process.
		// In that case, we skip rendering static files for the redirect routes.
		if (routeIsRedirect(route) && !config.build.redirects) {
			return undefined;
		}
		const locationSite = getRedirectLocationOrThrow(response.headers);
		const siteURL = config.site;
		const location = siteURL ? new URL(locationSite, siteURL) : locationSite;
		const fromPath = new URL(request.url).pathname;
		body = redirectTemplate({ status: response.status, location, from: fromPath });
		if (config.compressHTML === true) {
			body = body.replaceAll('\n', '');
		}
		// A dynamic redirect, set the location so that integrations know about it.
		if (route.type !== 'redirect') {
			route.redirect = location.toString();
		}
	} else {
		// If there's no body, do nothing
		if (!response.body) return false;
		body = Buffer.from(await response.arrayBuffer());
	}

	// We encode the path because some paths will received encoded characters, e.g. /[page] VS /%5Bpage%5D.
	// Node.js decodes the paths, so to avoid a clash between paths, do encode paths again, so we create the correct files and folders requested by the user.
	const encodedPath = encodeURI(pathname);
	const outFolder = getOutFolder(pipeline.settings, encodedPath, route);
	const outFile = getOutFile(config, outFolder, encodedPath, route);
	if (route.distURL) {
		route.distURL.push(outFile);
	} else {
		route.distURL = [outFile];
	}

	await fs.promises.mkdir(outFolder, { recursive: true });
	await fs.promises.writeFile(outFile, body);

	return true;
}

function getPrettyRouteName(route: RouteData): string {
	if (isRelativePath(route.component)) {
		return route.route;
	}
	if (route.component.includes('node_modules/')) {
		// For routes from node_modules (usually injected by integrations),
		// prettify it by only grabbing the part after the last `node_modules/`
		return /.*node_modules\/(.+)/.exec(route.component)?.[1] ?? route.component;
	}
	return route.component;
}

/**
 * It creates a `SSRManifest` from the `AstroSettings`.
 *
 * Renderers needs to be pulled out from the page module emitted during the build.
 * @param settings
 * @param renderers
 */
function createBuildManifest(
	settings: AstroSettings,
	internals: BuildInternals,
	renderers: SSRLoadedRenderer[],
	middleware: MiddlewareHandler,
	key: Promise<CryptoKey>,
): SSRManifest {
	let i18nManifest: SSRManifestI18n | undefined = undefined;
	if (settings.config.i18n) {
		i18nManifest = {
			fallback: settings.config.i18n.fallback,
			fallbackType: toFallbackType(settings.config.i18n.routing),
			strategy: toRoutingStrategy(settings.config.i18n.routing, settings.config.i18n.domains),
			defaultLocale: settings.config.i18n.defaultLocale,
			locales: settings.config.i18n.locales,
			domainLookupTable: {},
		};
	}
	return {
		hrefRoot: settings.config.root.toString(),
		srcDir: settings.config.srcDir,
		buildClientDir: settings.config.build.client,
		buildServerDir: settings.config.build.server,
		publicDir: settings.config.publicDir,
		outDir: settings.config.outDir,
		cacheDir: settings.config.cacheDir,
		trailingSlash: settings.config.trailingSlash,
		assets: new Set(),
		entryModules: Object.fromEntries(internals.entrySpecifierToBundleMap.entries()),
		inlinedScripts: internals.inlinedScripts,
		routes: [],
		adapterName: '',
		clientDirectives: settings.clientDirectives,
		compressHTML: settings.config.compressHTML,
		renderers,
		base: settings.config.base,
		assetsPrefix: settings.config.build.assetsPrefix,
		site: settings.config.site,
		componentMetadata: internals.componentMetadata,
		i18n: i18nManifest,
		buildFormat: settings.config.build.format,
		middleware() {
			return {
				onRequest: middleware,
			};
		},
		checkOrigin:
			(settings.config.security?.checkOrigin && settings.buildOutput === 'server') ?? false,
		key,
	};
}

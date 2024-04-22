import type {
	ComponentInstance,
	ReroutePayload,
	RouteData,
	SSRLoadedRenderer,
	SSRResult,
} from '../../@types/astro.js';
import { getOutputDirectory, isServerLikeOutput } from '../../prerender/utils.js';
import { BEFORE_HYDRATION_SCRIPT_ID, PAGE_SCRIPT_ID } from '../../vite-plugin-scripts/index.js';
import type { SSRManifest } from '../app/types.js';
import { routeIsFallback, routeIsRedirect } from '../redirects/helpers.js';
import { Pipeline } from '../render/index.js';
import {
	createAssetLink,
	createModuleScriptsSet,
	createStylesheetElementSet,
} from '../render/ssr-element.js';
import {
	type BuildInternals,
	cssOrder,
	getEntryFilePathFromComponentPath,
	getPageDataByComponent,
	mergeInlineCss,
} from './internal.js';
import { ASTRO_PAGE_MODULE_ID, ASTRO_PAGE_RESOLVED_MODULE_ID } from './plugins/plugin-pages.js';
import { RESOLVED_SPLIT_MODULE_ID } from './plugins/plugin-ssr.js';
import {
	ASTRO_PAGE_EXTENSION_POST_PATTERN,
	getVirtualModulePageNameFromPath,
} from './plugins/util.js';
import type { PageBuildData, SinglePageBuiltModule, StaticBuildOptions } from './types.js';
import { i18nHasFallback } from './util.js';
import { RedirectSinglePageBuiltModule } from '../redirects/index.js';
import { getOutDirWithinCwd } from './common.js';

/**
 * The build pipeline is responsible to gather the files emitted by the SSR build and generate the pages by executing these files.
 */
export class BuildPipeline extends Pipeline {
	#componentsInterner: WeakMap<RouteData, SinglePageBuiltModule> = new WeakMap();
	/**
	 * This cache is needed to map a single `RouteData` to its file path.
	 * @private
	 */
	#routesByFilePath: WeakMap<RouteData, string> = new WeakMap();

	get outFolder() {
		const ssr = isServerLikeOutput(this.settings.config);
		return ssr
			? this.settings.config.build.server
			: getOutDirWithinCwd(this.settings.config.outDir);
	}

	private constructor(
		readonly internals: BuildInternals,
		readonly manifest: SSRManifest,
		readonly options: StaticBuildOptions,
		readonly config = options.settings.config,
		readonly settings = options.settings
	) {
		const resolveCache = new Map<string, string>();
		async function resolve(specifier: string) {
			if (resolveCache.has(specifier)) {
				return resolveCache.get(specifier)!;
			}
			const hashedFilePath = manifest.entryModules[specifier];
			if (typeof hashedFilePath !== 'string' || hashedFilePath === '') {
				// If no "astro:scripts/before-hydration.js" script exists in the build,
				// then we can assume that no before-hydration scripts are needed.
				if (specifier === BEFORE_HYDRATION_SCRIPT_ID) {
					resolveCache.set(specifier, '');
					return '';
				}
				throw new Error(`Cannot find the built path for ${specifier}`);
			}
			const assetLink = createAssetLink(hashedFilePath, manifest.base, manifest.assetsPrefix);
			resolveCache.set(specifier, assetLink);
			return assetLink;
		}
		const serverLike = isServerLikeOutput(config);
		const streaming = true;
		super(
			options.logger,
			manifest,
			options.mode,
			manifest.renderers,
			resolve,
			serverLike,
			streaming
		);
	}

	static create({
		internals,
		manifest,
		options,
	}: Pick<BuildPipeline, 'internals' | 'manifest' | 'options'>) {
		return new BuildPipeline(internals, manifest, options);
	}

	/**
	 * The SSR build emits two important files:
	 * - dist/server/manifest.mjs
	 * - dist/renderers.mjs
	 *
	 * These two files, put together, will be used to generate the pages.
	 *
	 * ## Errors
	 *
	 * It will throw errors if the previous files can't be found in the file system.
	 *
	 * @param staticBuildOptions
	 */
	static async retrieveManifest(
		staticBuildOptions: StaticBuildOptions,
		internals: BuildInternals
	): Promise<SSRManifest> {
		const config = staticBuildOptions.settings.config;
		const baseDirectory = getOutputDirectory(config);
		const manifestEntryUrl = new URL(
			`${internals.manifestFileName}?time=${Date.now()}`,
			baseDirectory
		);
		const { manifest } = await import(manifestEntryUrl.toString());
		if (!manifest) {
			throw new Error(
				"Astro couldn't find the emitted manifest. This is an internal error, please file an issue."
			);
		}

		const renderersEntryUrl = new URL(`renderers.mjs?time=${Date.now()}`, baseDirectory);
		const renderers = await import(renderersEntryUrl.toString());

		const middleware = await import(new URL('middleware.mjs', baseDirectory).toString())
			.then((mod) => mod.onRequest)
			// middleware.mjs is not emitted if there is no user middleware
			// in which case the import fails with ERR_MODULE_NOT_FOUND, and we fall back to a no-op middleware
			.catch(() => manifest.middleware);

		if (!renderers) {
			throw new Error(
				"Astro couldn't find the emitted renderers. This is an internal error, please file an issue."
			);
		}
		return {
			...manifest,
			renderers: renderers.renderers as SSRLoadedRenderer[],
			middleware,
		};
	}

	headElements(routeData: RouteData): Pick<SSRResult, 'scripts' | 'styles' | 'links'> {
		const {
			internals,
			manifest: { assetsPrefix, base },
			settings,
		} = this;
		const links = new Set<never>();
		const pageBuildData = getPageDataByComponent(internals, routeData.component);
		const scripts = createModuleScriptsSet(
			pageBuildData?.hoistedScript ? [pageBuildData.hoistedScript] : [],
			base,
			assetsPrefix
		);
		const sortedCssAssets = pageBuildData?.styles
			.sort(cssOrder)
			.map(({ sheet }) => sheet)
			.reduce(mergeInlineCss, []);
		const styles = createStylesheetElementSet(sortedCssAssets ?? [], base, assetsPrefix);

		if (settings.scripts.some((script) => script.stage === 'page')) {
			const hashedFilePath = internals.entrySpecifierToBundleMap.get(PAGE_SCRIPT_ID);
			if (typeof hashedFilePath !== 'string') {
				throw new Error(`Cannot find the built path for ${PAGE_SCRIPT_ID}`);
			}
			const src = createAssetLink(hashedFilePath, base, assetsPrefix);
			scripts.add({
				props: { type: 'module', src },
				children: '',
			});
		}

		// Add all injected scripts to the page.
		for (const script of settings.scripts) {
			if (script.stage === 'head-inline') {
				scripts.add({
					props: {},
					children: script.content,
				});
			}
		}
		return { scripts, styles, links };
	}

	componentMetadata() {}

	/**
	 * It collects the routes to generate during the build.
	 *
	 * It returns a map of page information and their relative entry point as a string.
	 */
	retrieveRoutesToGenerate(): Map<PageBuildData, string> {
		const pages = new Map<PageBuildData, string>();

		for (const [entrypoint, filePath] of this.internals.entrySpecifierToBundleMap) {
			// virtual pages can be emitted with different prefixes:
			// - the classic way are pages emitted with prefix ASTRO_PAGE_RESOLVED_MODULE_ID -> plugin-pages
			// - pages emitted using `build.split`, in this case pages are emitted with prefix RESOLVED_SPLIT_MODULE_ID
			if (
				entrypoint.includes(ASTRO_PAGE_RESOLVED_MODULE_ID) ||
				entrypoint.includes(RESOLVED_SPLIT_MODULE_ID)
			) {
				const [, pageName] = entrypoint.split(':');
				const pageData = this.internals.pagesByComponent.get(
					`${pageName.replace(ASTRO_PAGE_EXTENSION_POST_PATTERN, '.')}`
				);
				if (!pageData) {
					throw new Error(
						"Build failed. Astro couldn't find the emitted page from " + pageName + ' pattern'
					);
				}

				pages.set(pageData, filePath);
			}
		}

		for (const [path, pageData] of this.internals.pagesByComponent.entries()) {
			if (routeIsRedirect(pageData.route)) {
				pages.set(pageData, path);
			} else if (
				routeIsFallback(pageData.route) &&
				(i18nHasFallback(this.config) ||
					(routeIsFallback(pageData.route) && pageData.route.route === '/'))
			) {
				// The original component is transformed during the first build, so we have to retrieve
				// the actual `.mjs` that was created.
				// During the build, we transform the names of our pages with some weird name, and those weird names become the keys of a map.
				// The values of the map are the actual `.mjs` files that are generated during the build

				// Here, we take the component path and transform it in the virtual module name
				const moduleSpecifier = getVirtualModulePageNameFromPath(ASTRO_PAGE_MODULE_ID, path);
				// We retrieve the original JS module
				const filePath = this.internals.entrySpecifierToBundleMap.get(moduleSpecifier);
				if (filePath) {
					// it exists, added it to pages to render, using the file path that we jus retrieved
					pages.set(pageData, filePath);
				}
			}
		}

		for (const [buildData, filePath] of pages.entries()) {
			this.#routesByFilePath.set(buildData.route, filePath);
		}

		return pages;
	}

	async getComponentByRoute(routeData: RouteData): Promise<ComponentInstance> {
		if (this.#componentsInterner.has(routeData)) {
			// SAFETY: checked before
			const entry = this.#componentsInterner.get(routeData)!;
			return await entry.page();
		} else {
			// SAFETY: the pipeline calls `retrieveRoutesToGenerate`, which is in charge to fill the cache.
			let filePath = this.#routesByFilePath.get(routeData)!;
			const module = await this.retrieveSsrEntry(routeData, filePath);
			return module.page();
		}
	}

	async tryReroute(payload: ReroutePayload): Promise<[RouteData, ComponentInstance]> {
		let foundRoute: RouteData | undefined;
		// options.manifest is the actual type that contains the information
		for (const route of this.options.manifest.routes) {
			if (payload instanceof URL) {
				if (route.pattern.test(payload.pathname)) {
					foundRoute = route;
					break;
				}
			} else if (payload instanceof Request) {
				const url = new URL(payload.url);
				if (route.pattern.test(url.pathname)) {
					foundRoute = route;
					break;
				}
			} else {
				if (route.pattern.test(decodeURI(payload))) {
					foundRoute = route;
					break;
				}
			}
		}
		if (foundRoute) {
			const componentInstance = await this.getComponentByRoute(foundRoute);
			return [foundRoute, componentInstance];
		} else {
			throw new Error('Route not found');
		}
	}

	async retrieveSsrEntry(route: RouteData, filePath: string): Promise<SinglePageBuiltModule> {
		if (this.#componentsInterner.has(route)) {
			// SAFETY: it is checked inside the if
			return this.#componentsInterner.get(route)!;
		}
		let entry;
		if (routeIsRedirect(route)) {
			entry = await this.#getEntryForRedirectRoute(route, this.internals, this.outFolder);
		} else if (routeIsFallback(route)) {
			entry = await this.#getEntryForFallbackRoute(route, this.internals, this.outFolder);
		} else {
			const ssrEntryURLPage = createEntryURL(filePath, this.outFolder);
			entry = await import(ssrEntryURLPage.toString());
		}
		this.#componentsInterner.set(route, entry);
		return entry;
	}

	async #getEntryForFallbackRoute(
		route: RouteData,
		internals: BuildInternals,
		outFolder: URL
	): Promise<SinglePageBuiltModule> {
		if (route.type !== 'fallback') {
			throw new Error(`Expected a redirect route.`);
		}
		if (route.redirectRoute) {
			const filePath = getEntryFilePathFromComponentPath(internals, route.redirectRoute.component);
			if (filePath) {
				const url = createEntryURL(filePath, outFolder);
				const ssrEntryPage: SinglePageBuiltModule = await import(url.toString());
				return ssrEntryPage;
			}
		}

		return RedirectSinglePageBuiltModule;
	}

	async #getEntryForRedirectRoute(
		route: RouteData,
		internals: BuildInternals,
		outFolder: URL
	): Promise<SinglePageBuiltModule> {
		if (route.type !== 'redirect') {
			throw new Error(`Expected a redirect route.`);
		}
		if (route.redirectRoute) {
			const filePath = getEntryFilePathFromComponentPath(internals, route.redirectRoute.component);
			if (filePath) {
				const url = createEntryURL(filePath, outFolder);
				const ssrEntryPage: SinglePageBuiltModule = await import(url.toString());
				return ssrEntryPage;
			}
		}

		return RedirectSinglePageBuiltModule;
	}
}

function createEntryURL(filePath: string, outFolder: URL) {
	return new URL('./' + filePath + `?time=${Date.now()}`, outFolder);
}

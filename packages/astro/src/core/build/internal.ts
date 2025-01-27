import type { Rollup } from 'vite';
import type { RouteData, SSRResult } from '../../types/public/internal.js';
import { prependForwardSlash, removeFileExtension } from '../path.js';
import { viteID } from '../util.js';
import { makePageDataKey } from './plugins/util.js';
import type { PageBuildData, StylesheetAsset, ViteID } from './types.js';

export interface BuildInternals {
	/**
	 * Each CSS module is named with a chunk id derived from the Astro pages they
	 * are used in by default. It's easy to crawl this relation in the SSR build as
	 * the Astro pages are the entrypoint, but not for the client build as hydratable
	 * components are the entrypoint instead. This map is used as a cache from the SSR
	 * build so the client can pick up the same information and use the same chunk ids.
	 */
	cssModuleToChunkIdMap: Map<string, string>;

	/**
	 * If script is inlined, its id and inlined code is mapped here. The resolved id is
	 * an URL like "/_astro/something.js" but will no longer exist as the content is now
	 * inlined in this map.
	 */
	inlinedScripts: Map<string, string>;

	// A mapping of specifiers like astro/client/idle.js to the hashed bundled name.
	// Used to render pages with the correct specifiers.
	entrySpecifierToBundleMap: Map<string, string>;

	/**
	 * A map for page-specific information.
	 */
	pagesByKeys: Map<string, PageBuildData>;

	/**
	 * A map for page-specific information by Vite ID (a path-like string)
	 */
	pagesByViteID: Map<ViteID, PageBuildData>;

	/**
	 * A map for page-specific information by a client:only component
	 */
	pagesByClientOnly: Map<string, Set<PageBuildData>>;

	/**
	 * A map for page-specific information by a script in an Astro file
	 */
	pagesByScriptId: Map<string, Set<PageBuildData>>;

	/**
	 * A map of hydrated components to export names that are discovered during the SSR build.
	 * These will be used as the top-level entrypoints for the client build.
	 *
	 * @example
	 * '/project/Component1.jsx' => ['default']
	 * '/project/Component2.jsx' => ['Counter', 'Timer']
	 * '/project/Component3.jsx' => ['*']
	 */
	discoveredHydratedComponents: Map<string, string[]>;
	/**
	 * A list of client:only components to export names that are discovered during the SSR build.
	 * These will be used as the top-level entrypoints for the client build.
	 *
	 * @example
	 * '/project/Component1.jsx' => ['default']
	 * '/project/Component2.jsx' => ['Counter', 'Timer']
	 * '/project/Component3.jsx' => ['*']
	 */
	discoveredClientOnlyComponents: Map<string, string[]>;
	/**
	 * A list of scripts that are discovered during the SSR build.
	 * These will be used as the top-level entrypoints for the client build.
	 */
	discoveredScripts: Set<string>;

	/**
	 * Map of propagated module ids (usually something like `/Users/...blog.mdx?astroPropagatedAssets`)
	 * to a set of stylesheets that it uses.
	 */
	propagatedStylesMap: Map<string, Set<StylesheetAsset>>;

	// A list of all static files created during the build. Used for SSR.
	staticFiles: Set<string>;
	// The SSR entry chunk. Kept in internals to share between ssr/client build steps
	ssrEntryChunk?: Rollup.OutputChunk;
	// The SSR manifest entry chunk.
	manifestEntryChunk?: Rollup.OutputChunk;
	manifestFileName?: string;
	entryPoints: Map<RouteData, URL>;
	componentMetadata: SSRResult['componentMetadata'];
	middlewareEntryPoint?: URL;

	/**
	 * Chunks in the bundle that are only used in prerendering that we can delete later
	 */
	prerenderOnlyChunks: Rollup.OutputChunk[];
}

/**
 * Creates internal maps used to coordinate the CSS and HTML plugins.
 * @returns {BuildInternals}
 */
export function createBuildInternals(): BuildInternals {
	return {
		cssModuleToChunkIdMap: new Map(),
		inlinedScripts: new Map(),
		entrySpecifierToBundleMap: new Map<string, string>(),
		pagesByKeys: new Map(),
		pagesByViteID: new Map(),
		pagesByClientOnly: new Map(),
		pagesByScriptId: new Map(),

		propagatedStylesMap: new Map(),

		discoveredHydratedComponents: new Map(),
		discoveredClientOnlyComponents: new Map(),
		discoveredScripts: new Set(),
		staticFiles: new Set(),
		componentMetadata: new Map(),
		entryPoints: new Map(),
		prerenderOnlyChunks: [],
	};
}

export function trackPageData(
	internals: BuildInternals,
	_component: string,
	pageData: PageBuildData,
	componentModuleId: string,
	componentURL: URL,
): void {
	pageData.moduleSpecifier = componentModuleId;
	internals.pagesByKeys.set(pageData.key, pageData);
	internals.pagesByViteID.set(viteID(componentURL), pageData);
}

/**
 * Tracks client-only components to the pages they are associated with.
 */
export function trackClientOnlyPageDatas(
	internals: BuildInternals,
	pageData: PageBuildData,
	clientOnlys: string[],
) {
	for (const clientOnlyComponent of clientOnlys) {
		let pageDataSet: Set<PageBuildData>;
		// clientOnlyComponent will be similar to `/@fs{moduleID}`
		if (internals.pagesByClientOnly.has(clientOnlyComponent)) {
			pageDataSet = internals.pagesByClientOnly.get(clientOnlyComponent)!;
		} else {
			pageDataSet = new Set<PageBuildData>();
			internals.pagesByClientOnly.set(clientOnlyComponent, pageDataSet);
		}
		pageDataSet.add(pageData);
	}
}

/**
 * Tracks scripts to the pages they are associated with.
 */
export function trackScriptPageDatas(
	internals: BuildInternals,
	pageData: PageBuildData,
	scriptIds: string[],
) {
	for (const scriptId of scriptIds) {
		let pageDataSet: Set<PageBuildData>;
		if (internals.pagesByScriptId.has(scriptId)) {
			pageDataSet = internals.pagesByScriptId.get(scriptId)!;
		} else {
			pageDataSet = new Set<PageBuildData>();
			internals.pagesByScriptId.set(scriptId, pageDataSet);
		}
		pageDataSet.add(pageData);
	}
}

export function* getPageDatasByClientOnlyID(
	internals: BuildInternals,
	viteid: ViteID,
): Generator<PageBuildData, void, unknown> {
	const pagesByClientOnly = internals.pagesByClientOnly;
	if (pagesByClientOnly.size) {
		// 1. Try the viteid
		let pageBuildDatas = pagesByClientOnly.get(viteid);

		// 2. Try prepending /@fs
		if (!pageBuildDatas) {
			let pathname = `/@fs${prependForwardSlash(viteid)}`;
			pageBuildDatas = pagesByClientOnly.get(pathname);
		}

		// 3. Remove the file extension
		// BUG! The compiler partially resolves .jsx to remove the file extension so we have to check again.
		// We should probably get rid of all `@fs` usage and always fully resolve via Vite,
		// but this would be a bigger change.
		if (!pageBuildDatas) {
			let pathname = `/@fs${prependForwardSlash(removeFileExtension(viteid))}`;
			pageBuildDatas = pagesByClientOnly.get(pathname);
		}
		if (pageBuildDatas) {
			for (const pageData of pageBuildDatas) {
				yield pageData;
			}
		}
	}
}

/**
 * From its route and component, get the page data from the build internals.
 * @param internals Build Internals with all the pages
 * @param route The route of the page, used to identify the page
 * @param component The component of the page, used to identify the page
 */
export function getPageData(
	internals: BuildInternals,
	route: string,
	component: string,
): PageBuildData | undefined {
	let pageData = internals.pagesByKeys.get(makePageDataKey(route, component));
	if (pageData) {
		return pageData;
	}
	return undefined;
}

export function getPageDataByViteID(
	internals: BuildInternals,
	viteid: ViteID,
): PageBuildData | undefined {
	if (internals.pagesByViteID.has(viteid)) {
		return internals.pagesByViteID.get(viteid);
	}
	return undefined;
}

export function hasPrerenderedPages(internals: BuildInternals) {
	for (const pageData of internals.pagesByKeys.values()) {
		if (pageData.route.prerender) {
			return true;
		}
	}
	return false;
}

interface OrderInfo {
	depth: number;
	order: number;
}

/**
 * Sort a page's CSS by depth. A higher depth means that the CSS comes from shared subcomponents.
 * A lower depth means it comes directly from the top-level page.
 * Can be used to sort stylesheets so that shared rules come first
 * and page-specific rules come after.
 */
export function cssOrder(a: OrderInfo, b: OrderInfo) {
	let depthA = a.depth,
		depthB = b.depth,
		orderA = a.order,
		orderB = b.order;

	if (orderA === -1 && orderB >= 0) {
		return 1;
	} else if (orderB === -1 && orderA >= 0) {
		return -1;
	} else if (orderA > orderB) {
		return 1;
	} else if (orderA < orderB) {
		return -1;
	} else {
		if (depthA === -1) {
			return -1;
		} else if (depthB === -1) {
			return 1;
		} else {
			return depthA > depthB ? -1 : 1;
		}
	}
}

export function mergeInlineCss(
	acc: Array<StylesheetAsset>,
	current: StylesheetAsset,
): Array<StylesheetAsset> {
	const lastAdded = acc.at(acc.length - 1);
	const lastWasInline = lastAdded?.type === 'inline';
	const currentIsInline = current?.type === 'inline';
	if (lastWasInline && currentIsInline) {
		const merged = { type: 'inline' as const, content: lastAdded.content + current.content };
		acc[acc.length - 1] = merged;
		return acc;
	}
	acc.push(current);
	return acc;
}

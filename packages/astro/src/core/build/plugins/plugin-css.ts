import type { GetModuleInfo } from 'rollup';
import type { BuildOptions, ResolvedConfig, Rollup, Plugin as VitePlugin } from 'vite';
import { isBuildableCSSRequest } from '../../../vite-plugin-astro-server/util.js';
import type { BuildInternals } from '../internal.js';
import type { AstroBuildPlugin, BuildTarget } from '../plugin.js';
import type { PageBuildData, StaticBuildOptions, StylesheetAsset } from '../types.js';

import { hasAssetPropagationFlag } from '../../../content/index.js';
import type { AstroPluginCssMetadata } from '../../../vite-plugin-astro/index.js';
import * as assetName from '../css-asset-name.js';
import {
	getParentExtendedModuleInfos,
	getParentModuleInfos,
	moduleIsTopLevelPage,
} from '../graph.js';
import { getPageDataByViteID, getPageDatasByClientOnlyID } from '../internal.js';
import { extendManualChunks, shouldInlineAsset } from './util.js';

interface PluginOptions {
	internals: BuildInternals;
	buildOptions: StaticBuildOptions;
	target: BuildTarget;
}

/***** ASTRO PLUGIN *****/

export function pluginCSS(
	options: StaticBuildOptions,
	internals: BuildInternals,
): AstroBuildPlugin {
	return {
		targets: ['client', 'server'],
		hooks: {
			'build:before': ({ target }) => {
				let plugins = rollupPluginAstroBuildCSS({
					buildOptions: options,
					internals,
					target,
				});

				return {
					vitePlugin: plugins,
				};
			},
		},
	};
}

/***** ROLLUP SUB-PLUGINS *****/

function rollupPluginAstroBuildCSS(options: PluginOptions): VitePlugin[] {
	const { internals, buildOptions } = options;
	const { settings } = buildOptions;

	let resolvedConfig: ResolvedConfig;

	// stylesheet filenames are kept in here until "post", when they are rendered and ready to be inlined
	const pagesToCss: Record<string, Record<string, { order: number; depth: number }>> = {};
	// Map of module Ids (usually something like `/Users/...blog.mdx?astroPropagatedAssets`) to its imported CSS
	const moduleIdToPropagatedCss: Record<string, Set<string>> = {};

	const cssBuildPlugin: VitePlugin = {
		name: 'astro:rollup-plugin-build-css',

		outputOptions(outputOptions) {
			const assetFileNames = outputOptions.assetFileNames;
			const namingIncludesHash = assetFileNames?.toString().includes('[hash]');
			const createNameForParentPages = namingIncludesHash
				? assetName.shortHashedName(settings)
				: assetName.createSlugger(settings);

			extendManualChunks(outputOptions, {
				after(id, meta) {
					// For CSS, create a hash of all of the pages that use it.
					// This causes CSS to be built into shared chunks when used by multiple pages.
					if (isBuildableCSSRequest(id)) {
						// For client builds that has hydrated components as entrypoints, there's no way
						// to crawl up and find the pages that use it. So we lookup the cache during SSR
						// build (that has the pages information) to derive the same chunk id so they
						// match up on build, making sure both builds has the CSS deduped.
						// NOTE: Components that are only used with `client:only` may not exist in the cache
						// and that's okay. We can use Rollup's default chunk strategy instead as these CSS
						// are outside of the SSR build scope, which no dedupe is needed.
						if (options.target === 'client') {
							return internals.cssModuleToChunkIdMap.get(id)!;
						}

						const ctx = { getModuleInfo: meta.getModuleInfo };
						for (const pageInfo of getParentModuleInfos(id, ctx)) {
							if (hasAssetPropagationFlag(pageInfo.id)) {
								// Split delayed assets to separate modules
								// so they can be injected where needed
								const chunkId = assetName.createNameHash(id, [id], settings);
								internals.cssModuleToChunkIdMap.set(id, chunkId);
								return chunkId;
							}
						}
						const chunkId = createNameForParentPages(id, meta);
						internals.cssModuleToChunkIdMap.set(id, chunkId);
						return chunkId;
					}
				},
			});
		},

		async generateBundle(_outputOptions, bundle) {
			for (const [, chunk] of Object.entries(bundle)) {
				if (chunk.type !== 'chunk') continue;
				if ('viteMetadata' in chunk === false) continue;
				const meta = chunk.viteMetadata as ViteMetadata;

				// Skip if the chunk has no CSS, we want to handle CSS chunks only
				if (meta.importedCss.size < 1) continue;

				// For the client build, client:only styles need to be mapped
				// over to their page. For this chunk, determine if it's a child of a
				// client:only component and if so, add its CSS to the page it belongs to.
				if (options.target === 'client') {
					for (const id of Object.keys(chunk.modules)) {
						for (const pageData of getParentClientOnlys(id, this, internals)) {
							for (const importedCssImport of meta.importedCss) {
								const cssToInfoRecord = (pagesToCss[pageData.moduleSpecifier] ??= {});
								cssToInfoRecord[importedCssImport] = { depth: -1, order: -1 };
							}
						}
					}
				}

				// For this CSS chunk, walk parents until you find a page. Add the CSS to that page.
				for (const id of Object.keys(chunk.modules)) {
					const parentModuleInfos = getParentExtendedModuleInfos(id, this, hasAssetPropagationFlag);
					for (const { info: pageInfo, depth, order } of parentModuleInfos) {
						if (hasAssetPropagationFlag(pageInfo.id)) {
							const propagatedCss = (moduleIdToPropagatedCss[pageInfo.id] ??= new Set());
							for (const css of meta.importedCss) {
								propagatedCss.add(css);
							}
						} else if (moduleIsTopLevelPage(pageInfo)) {
							const pageViteID = pageInfo.id;
							const pageData = getPageDataByViteID(internals, pageViteID);
							if (pageData) {
								appendCSSToPage(pageData, meta, pagesToCss, depth, order);
							}
						} else if (options.target === 'client') {
							// For scripts, walk parents until you find a page, and add the CSS to that page.
							const pageDatas = internals.pagesByScriptId.get(pageInfo.id)!;
							if (pageDatas) {
								for (const pageData of pageDatas) {
									appendCSSToPage(pageData, meta, pagesToCss, -1, order);
								}
							}
						}
					}
				}
			}
		},
	};

	/**
	 * This plugin is a port of https://github.com/vitejs/vite/pull/16058. It enables removing unused
	 * scoped CSS from the bundle if the scoped target (e.g. Astro files) were not bundled.
	 * Once/If that PR is merged, we can refactor this away, renaming `meta.astroCss` to `meta.vite`.
	 */
	const cssScopeToPlugin: VitePlugin = {
		name: 'astro:rollup-plugin-css-scope-to',
		renderChunk(_, chunk, __, meta) {
			for (const id in chunk.modules) {
				// If this CSS is scoped to its importers exports, check if those importers exports
				// are rendered in the chunks. If they are not, we can skip bundling this CSS.
				const modMeta = this.getModuleInfo(id)?.meta as AstroPluginCssMetadata | undefined;
				const cssScopeTo = modMeta?.astroCss?.cssScopeTo;
				if (cssScopeTo && !isCssScopeToRendered(cssScopeTo, Object.values(meta.chunks))) {
					// If this CSS is not used, delete it from the chunk modules so that Vite is unable
					// to trace that it's used
					delete chunk.modules[id];
					const moduleIdsIndex = chunk.moduleIds.indexOf(id);
					if (moduleIdsIndex > -1) {
						chunk.moduleIds.splice(moduleIdsIndex, 1);
					}
				}
			}
		},
	};

	const singleCssPlugin: VitePlugin = {
		name: 'astro:rollup-plugin-single-css',
		enforce: 'post',
		configResolved(config) {
			resolvedConfig = config;
		},
		generateBundle(_, bundle) {
			// If user disable css code-splitting, search for Vite's hardcoded
			// `style.css` and add it as css for each page.
			// Ref: https://github.com/vitejs/vite/blob/b2c0ee04d4db4a0ef5a084c50f49782c5f88587c/packages/vite/src/node/plugins/html.ts#L690-L705
			if (resolvedConfig.build.cssCodeSplit) return;
			const cssChunk = Object.values(bundle).find(
				(chunk) => chunk.type === 'asset' && chunk.name === 'style.css',
			);
			if (cssChunk === undefined) return;
			for (const pageData of internals.pagesByKeys.values()) {
				const cssToInfoMap = (pagesToCss[pageData.moduleSpecifier] ??= {});
				cssToInfoMap[cssChunk.fileName] = { depth: -1, order: -1 };
			}
		},
	};

	let assetsInlineLimit: NonNullable<BuildOptions['assetsInlineLimit']>;
	const inlineStylesheetsPlugin: VitePlugin = {
		name: 'astro:rollup-plugin-inline-stylesheets',
		enforce: 'post',
		configResolved(config) {
			assetsInlineLimit = config.build.assetsInlineLimit;
		},
		async generateBundle(_outputOptions, bundle) {
			const inlineConfig = settings.config.build.inlineStylesheets;
			Object.entries(bundle).forEach(([id, stylesheet]) => {
				if (
					stylesheet.type !== 'asset' ||
					stylesheet.name?.endsWith('.css') !== true ||
					typeof stylesheet.source !== 'string'
				)
					return;

				const toBeInlined =
					inlineConfig === 'always'
						? true
						: inlineConfig === 'never'
							? false
							: shouldInlineAsset(stylesheet.source, stylesheet.fileName, assetsInlineLimit);

				// there should be a single js object for each stylesheet,
				// allowing the single reference to be shared and checked for duplicates
				const sheet: StylesheetAsset = toBeInlined
					? { type: 'inline', content: stylesheet.source }
					: { type: 'external', src: stylesheet.fileName };

				let sheetAddedToPage = false;

				internals.pagesByKeys.forEach((pageData) => {
					const orderingInfo = pagesToCss[pageData.moduleSpecifier]?.[stylesheet.fileName];
					if (orderingInfo !== undefined) {
						pageData.styles.push({ ...orderingInfo, sheet });
						sheetAddedToPage = true;
					}
				});

				// Apply `moduleIdToPropagatedCss` information to `internals.propagatedStylesMap`.
				// NOTE: It's pretty much a copy over to `internals.propagatedStylesMap` as it should be
				// completely empty. The whole propagation handling could be better refactored in the future.
				for (const moduleId in moduleIdToPropagatedCss) {
					if (!moduleIdToPropagatedCss[moduleId].has(stylesheet.fileName)) continue;
					let propagatedStyles = internals.propagatedStylesMap.get(moduleId);
					if (!propagatedStyles) {
						propagatedStyles = new Set();
						internals.propagatedStylesMap.set(moduleId, propagatedStyles);
					}
					propagatedStyles.add(sheet);
					sheetAddedToPage = true;
				}

				if (toBeInlined && sheetAddedToPage) {
					// CSS is already added to all used pages, we can delete it from the bundle
					// and make sure no chunks reference it via `importedCss` (for Vite preloading)
					// to avoid duplicate CSS.
					delete bundle[id];
					for (const chunk of Object.values(bundle)) {
						if (chunk.type === 'chunk') {
							chunk.viteMetadata?.importedCss?.delete(id);
						}
					}
				}
			});
		},
	};

	return [cssBuildPlugin, cssScopeToPlugin, singleCssPlugin, inlineStylesheetsPlugin];
}

/***** UTILITY FUNCTIONS *****/

function* getParentClientOnlys(
	id: string,
	ctx: { getModuleInfo: GetModuleInfo },
	internals: BuildInternals,
): Generator<PageBuildData, void, unknown> {
	for (const info of getParentModuleInfos(id, ctx)) {
		yield* getPageDatasByClientOnlyID(internals, info.id);
	}
}

type ViteMetadata = {
	importedAssets: Set<string>;
	importedCss: Set<string>;
};

function appendCSSToPage(
	pageData: PageBuildData,
	meta: ViteMetadata,
	pagesToCss: Record<string, Record<string, { order: number; depth: number }>>,
	depth: number,
	order: number,
) {
	for (const importedCssImport of meta.importedCss) {
		// CSS is prioritized based on depth. Shared CSS has a higher depth due to being imported by multiple pages.
		// Depth info is used when sorting the links on the page.
		const cssInfo = pagesToCss[pageData.moduleSpecifier]?.[importedCssImport];
		if (cssInfo !== undefined) {
			if (depth < cssInfo.depth) {
				cssInfo.depth = depth;
			}

			// Update the order, preferring the lowest order we have.
			if (cssInfo.order === -1) {
				cssInfo.order = order;
			} else if (order < cssInfo.order && order > -1) {
				cssInfo.order = order;
			}
		} else {
			const cssToInfoRecord = (pagesToCss[pageData.moduleSpecifier] ??= {});
			cssToInfoRecord[importedCssImport] = { depth, order };
		}
	}
}

/**
 * `cssScopeTo` is a map of `importer`s to its `export`s. This function iterate each `cssScopeTo` entries
 * and check if the `importer` and its `export`s exists in the final chunks. If at least one matches,
 * `cssScopeTo` is considered "rendered" by Rollup and we return true.
 */
function isCssScopeToRendered(
	cssScopeTo: Record<string, string[]>,
	chunks: Rollup.RenderedChunk[],
) {
	for (const moduleId in cssScopeTo) {
		const exports = cssScopeTo[moduleId];
		// Find the chunk that renders this `moduleId` and get the rendered module
		const renderedModule = chunks.find((c) => c.moduleIds.includes(moduleId))?.modules[moduleId];
		// Return true if `renderedModule` exists and one of its exports is rendered
		if (renderedModule?.renderedExports.some((e) => exports.includes(e))) {
			return true;
		}
	}

	return false;
}

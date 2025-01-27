import type { Rollup, Plugin as VitePlugin } from 'vite';
import { getPrerenderMetadata } from '../../../prerender/metadata.js';
import type { BuildInternals } from '../internal.js';
import type { AstroBuildPlugin } from '../plugin.js';
import type { StaticBuildOptions } from '../types.js';
import { ASTRO_PAGE_RESOLVED_MODULE_ID } from './plugin-pages.js';
import { getPagesFromVirtualModulePageName } from './util.js';

function vitePluginPrerender(internals: BuildInternals): VitePlugin {
	return {
		name: 'astro:rollup-plugin-prerender',

		generateBundle(_, bundle) {
			const moduleIds = this.getModuleIds();
			for (const id of moduleIds) {
				const pageInfo = internals.pagesByViteID.get(id);
				if (!pageInfo) continue;
				const moduleInfo = this.getModuleInfo(id);
				if (!moduleInfo) continue;

				const prerender = !!getPrerenderMetadata(moduleInfo);
				pageInfo.route.prerender = prerender;
			}

			// Find all chunks used in the SSR runtime (that aren't used for prerendering only), then use
			// the Set to find the inverse, where chunks that are only used for prerendering. It's faster
			// to compute `internals.prerenderOnlyChunks` this way. The prerendered chunks will be deleted
			// after we finish prerendering.
			const nonPrerenderOnlyChunks = getNonPrerenderOnlyChunks(bundle, internals);
			internals.prerenderOnlyChunks = Object.values(bundle).filter((chunk) => {
				return chunk.type === 'chunk' && !nonPrerenderOnlyChunks.has(chunk);
			}) as Rollup.OutputChunk[];
		},
	};
}

function getNonPrerenderOnlyChunks(bundle: Rollup.OutputBundle, internals: BuildInternals) {
	const chunks = Object.values(bundle);

	const prerenderOnlyEntryChunks = new Set<Rollup.OutputChunk>();
	const nonPrerenderOnlyEntryChunks = new Set<Rollup.OutputChunk>();
	for (const chunk of chunks) {
		if (chunk.type === 'chunk' && chunk.isEntry) {
			// See if this entry chunk is prerendered, if so, skip it
			if (chunk.facadeModuleId?.startsWith(ASTRO_PAGE_RESOLVED_MODULE_ID)) {
				const pageDatas = getPagesFromVirtualModulePageName(
					internals,
					ASTRO_PAGE_RESOLVED_MODULE_ID,
					chunk.facadeModuleId,
				);
				const prerender = pageDatas.every((pageData) => pageData.route.prerender);
				if (prerender) {
					prerenderOnlyEntryChunks.add(chunk);
					continue;
				}
			}

			nonPrerenderOnlyEntryChunks.add(chunk);
		}
	}

	// From the `nonPrerenderedEntryChunks`, we crawl all the imports/dynamicImports to find all
	// other chunks that are use by the non-prerendered runtime
	const nonPrerenderOnlyChunks = new Set(nonPrerenderOnlyEntryChunks);
	for (const chunk of nonPrerenderOnlyChunks) {
		for (const importFileName of chunk.imports) {
			const importChunk = bundle[importFileName];
			if (importChunk?.type === 'chunk') {
				nonPrerenderOnlyChunks.add(importChunk);
			}
		}
		for (const dynamicImportFileName of chunk.dynamicImports) {
			const dynamicImportChunk = bundle[dynamicImportFileName];
			// The main server entry (entry.mjs) may import a prerender-only entry chunk, we skip in this case
			// to prevent incorrectly marking it as non-prerendered.
			if (
				dynamicImportChunk?.type === 'chunk' &&
				!prerenderOnlyEntryChunks.has(dynamicImportChunk)
			) {
				nonPrerenderOnlyChunks.add(dynamicImportChunk);
			}
		}
	}

	return nonPrerenderOnlyChunks;
}

export function pluginPrerender(
	opts: StaticBuildOptions,
	internals: BuildInternals,
): AstroBuildPlugin {
	// Static output can skip prerender completely because we're already rendering all pages
	if (opts.settings.buildOutput === 'static') {
		return { targets: ['server'] };
	}

	return {
		targets: ['server'],
		hooks: {
			'build:before': () => {
				return {
					vitePlugin: vitePluginPrerender(internals),
				};
			},
		},
	};
}

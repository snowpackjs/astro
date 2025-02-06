import type { Plugin as VitePlugin } from 'vite';
import type { PluginMetadata as AstroPluginMetadata } from '../../../vite-plugin-astro/types.js';
import { getTopLevelPageModuleInfos } from '../graph.js';
import type { BuildInternals } from '../internal.js';
import {
	getPageDataByViteID,
	trackClientOnlyPageDatas,
	trackScriptPageDatas,
} from '../internal.js';
import type { AstroBuildPlugin } from '../plugin.js';

export function vitePluginAnalyzer(internals: BuildInternals): VitePlugin {
	return {
		name: '@astro/rollup-plugin-astro-analyzer',
		async generateBundle() {
			const ids = this.getModuleIds();

			for (const id of ids) {
				const info = this.getModuleInfo(id);
				if (!info?.meta?.astro) continue;

				const astro = info.meta.astro as AstroPluginMetadata['astro'];

				for (const c of astro.hydratedComponents) {
					const rid = c.resolvedPath ? decodeURI(c.resolvedPath) : c.specifier;
					if (internals.discoveredHydratedComponents.has(rid)) {
						const exportNames = internals.discoveredHydratedComponents.get(rid);
						exportNames?.push(c.exportName);
					} else {
						internals.discoveredHydratedComponents.set(rid, [c.exportName]);
					}
				}

				if (astro.clientOnlyComponents.length) {
					const clientOnlys: string[] = [];

					for (const c of astro.clientOnlyComponents) {
						const cid = c.resolvedPath ? decodeURI(c.resolvedPath) : c.specifier;
						if (internals.discoveredClientOnlyComponents.has(cid)) {
							const exportNames = internals.discoveredClientOnlyComponents.get(cid);
							exportNames?.push(c.exportName);
						} else {
							internals.discoveredClientOnlyComponents.set(cid, [c.exportName]);
						}
						clientOnlys.push(cid);

						const resolvedId = await this.resolve(c.specifier, id);
						if (resolvedId) {
							clientOnlys.push(resolvedId.id);
						}
					}

					for (const pageInfo of getTopLevelPageModuleInfos(id, this)) {
						const newPageData = getPageDataByViteID(internals, pageInfo.id);
						if (!newPageData) continue;

						trackClientOnlyPageDatas(internals, newPageData, clientOnlys);
					}
				}

				// When directly rendering scripts, we don't need to group them together when bundling,
				// each script module is its own entrypoint, so we directly assign each script modules to
				// `discoveredScripts` here, which will eventually be passed as inputs of the client build.
				if (astro.scripts.length) {
					const scriptIds = astro.scripts.map(
						(_, i) => `${id.replace('/@fs', '')}?astro&type=script&index=${i}&lang.ts`,
					);

					// Assign as entrypoints for the client bundle
					for (const scriptId of scriptIds) {
						internals.discoveredScripts.add(scriptId);
					}

					// The script may import CSS, so we also have to track the pages that use this script
					for (const pageInfo of getTopLevelPageModuleInfos(id, this)) {
						const newPageData = getPageDataByViteID(internals, pageInfo.id);
						if (!newPageData) continue;

						trackScriptPageDatas(internals, newPageData, scriptIds);
					}
				}
			}
		},
	};
}

export function pluginAnalyzer(internals: BuildInternals): AstroBuildPlugin {
	return {
		targets: ['server'],
		hooks: {
			'build:before': () => {
				return {
					vitePlugin: vitePluginAnalyzer(internals),
				};
			},
		},
	};
}

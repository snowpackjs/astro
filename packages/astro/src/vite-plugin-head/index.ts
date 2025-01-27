import type { ModuleInfo } from 'rollup';
import type * as vite from 'vite';
import type { AstroBuildPlugin } from '../core/build/plugin.js';
import type { PluginMetadata } from '../vite-plugin-astro/types.js';

import { getParentModuleInfos, getTopLevelPageModuleInfos } from '../core/build/graph.js';
import type { BuildInternals } from '../core/build/internal.js';
import type { SSRComponentMetadata, SSRResult } from '../types/public/internal.js';
import { getAstroMetadata } from '../vite-plugin-astro/index.js';

// Detect this in comments, both in .astro components and in js/ts files.
const injectExp = /(?:^\/\/|\/\/!)\s*astro-head-inject/;

export default function configHeadVitePlugin(): vite.Plugin {
	let server: vite.ViteDevServer;

	function propagateMetadata<
		P extends keyof PluginMetadata['astro'],
		V extends PluginMetadata['astro'][P],
	>(
		this: { getModuleInfo(id: string): ModuleInfo | null },
		id: string,
		prop: P,
		value: V,
		seen = new Set<string>(),
	) {
		if (seen.has(id)) return;
		seen.add(id);
		const mod = server.moduleGraph.getModuleById(id);
		const info = this.getModuleInfo(id);

		if (info?.meta.astro) {
			const astroMetadata = getAstroMetadata(info);
			if (astroMetadata) {
				Reflect.set(astroMetadata, prop, value);
			}
		}

		for (const parent of mod?.importers || []) {
			if (parent.id) {
				propagateMetadata.call(this, parent.id, prop, value, seen);
			}
		}
	}

	return {
		name: 'astro:head-metadata',
		enforce: 'pre',
		apply: 'serve',
		configureServer(_server) {
			server = _server;
		},
		resolveId(source, importer) {
			if (importer) {
				// Do propagation any time a new module is imported. This is because
				// A module with propagation might be loaded before one of its parent pages
				// is loaded, in which case that parent page won't have the in-tree and containsHead
				// values. Walking up the tree in resolveId ensures that they do
				return this.resolve(source, importer, { skipSelf: true }).then((result) => {
					if (result) {
						let info = this.getModuleInfo(result.id);
						const astro = info && getAstroMetadata(info);
						if (astro) {
							if (astro.propagation === 'self' || astro.propagation === 'in-tree') {
								propagateMetadata.call(this, importer, 'propagation', 'in-tree');
							}
							if (astro.containsHead) {
								propagateMetadata.call(this, importer, 'containsHead', true);
							}
						}
					}
					return result;
				});
			}
		},
		transform(source, id) {
			if (!server) {
				return;
			}

			// TODO This could probably be removed now that this is handled in resolveId
			let info = this.getModuleInfo(id);
			if (info && getAstroMetadata(info)?.containsHead) {
				propagateMetadata.call(this, id, 'containsHead', true);
			}

			// TODO This could probably be removed now that this is handled in resolveId
			if (info && getAstroMetadata(info)?.propagation === 'self') {
				const mod = server.moduleGraph.getModuleById(id);
				for (const parent of mod?.importers ?? []) {
					if (parent.id) {
						propagateMetadata.call(this, parent.id, 'propagation', 'in-tree');
					}
				}
			}

			if (injectExp.test(source)) {
				propagateMetadata.call(this, id, 'propagation', 'in-tree');
			}
		},
	};
}

export function astroHeadBuildPlugin(internals: BuildInternals): AstroBuildPlugin {
	return {
		targets: ['server'],
		hooks: {
			'build:before'() {
				return {
					vitePlugin: {
						name: 'astro:head-metadata-build',
						generateBundle(_opts, bundle) {
							const map: SSRResult['componentMetadata'] = internals.componentMetadata;
							function getOrCreateMetadata(id: string): SSRComponentMetadata {
								if (map.has(id)) return map.get(id)!;
								const metadata: SSRComponentMetadata = {
									propagation: 'none',
									containsHead: false,
								};
								map.set(id, metadata);
								return metadata;
							}

							for (const [, output] of Object.entries(bundle)) {
								if (output.type !== 'chunk') continue;
								for (const [id, mod] of Object.entries(output.modules)) {
									const modinfo = this.getModuleInfo(id);

									// <head> tag in the tree
									if (modinfo) {
										const meta = getAstroMetadata(modinfo);
										if (meta?.containsHead) {
											for (const pageInfo of getTopLevelPageModuleInfos(id, this)) {
												let metadata = getOrCreateMetadata(pageInfo.id);
												metadata.containsHead = true;
											}
										}
										if (meta?.propagation === 'self') {
											for (const info of getParentModuleInfos(id, this)) {
												let metadata = getOrCreateMetadata(info.id);
												if (metadata.propagation !== 'self') {
													metadata.propagation = 'in-tree';
												}
											}
										}
									}

									// Head propagation (aka bubbling)
									if (mod.code && injectExp.test(mod.code)) {
										for (const info of getParentModuleInfos(id, this)) {
											getOrCreateMetadata(info.id).propagation = 'in-tree';
										}
									}
								}
							}
						},
					},
				};
			},
		},
	};
}

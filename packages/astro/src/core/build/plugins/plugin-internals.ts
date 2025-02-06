import type { Plugin as VitePlugin } from 'vite';
import type { BuildInternals } from '../internal.js';
import type { AstroBuildPlugin } from '../plugin.js';
import { normalizeEntryId } from './plugin-component-entry.js';

export function vitePluginInternals(input: Set<string>, internals: BuildInternals): VitePlugin {
	return {
		name: '@astro/plugin-build-internals',

		config(config, options) {
			if (options.command === 'build' && config.build?.ssr) {
				return {
					ssr: {
						// Always bundle Astro runtime when building for SSR
						noExternal: ['astro'],
						// Except for these packages as they're not bundle-friendly. Users with strict package installations
						// need to manually install these themselves if they use the related features.
						external: [
							'sharp', // For sharp image service
						],
					},
				};
			}
		},

		async generateBundle(_options, bundle) {
			const promises = [];
			const mapping = new Map<string, Set<string>>();
			for (const specifier of input) {
				promises.push(
					this.resolve(specifier).then((result) => {
						if (result) {
							if (mapping.has(result.id)) {
								mapping.get(result.id)!.add(specifier);
							} else {
								mapping.set(result.id, new Set<string>([specifier]));
							}
						}
					}),
				);
			}
			await Promise.all(promises);
			for (const [, chunk] of Object.entries(bundle)) {
				if (chunk.type === 'chunk' && chunk.facadeModuleId) {
					const specifiers = mapping.get(chunk.facadeModuleId) || new Set([chunk.facadeModuleId]);
					for (const specifier of specifiers) {
						internals.entrySpecifierToBundleMap.set(normalizeEntryId(specifier), chunk.fileName);
					}
				}
			}
		},
	};
}

export function pluginInternals(internals: BuildInternals): AstroBuildPlugin {
	return {
		targets: ['client', 'server'],
		hooks: {
			'build:before': ({ input }) => {
				return {
					vitePlugin: vitePluginInternals(input, internals),
				};
			},
		},
	};
}

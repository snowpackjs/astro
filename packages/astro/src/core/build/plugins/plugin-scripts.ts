import type { BuildOptions, Plugin as VitePlugin } from 'vite';
import type { BuildInternals } from '../internal.js';
import type { AstroBuildPlugin } from '../plugin.js';
import { shouldInlineAsset } from './util.js';

/**
 * Inline scripts from Astro files directly into the HTML.
 */
export function vitePluginScripts(internals: BuildInternals): VitePlugin {
	let assetInlineLimit: NonNullable<BuildOptions['assetsInlineLimit']>;

	return {
		name: '@astro/plugin-scripts',

		configResolved(config) {
			assetInlineLimit = config.build.assetsInlineLimit;
		},

		async generateBundle(_options, bundle) {
			const outputs = Object.values(bundle);

			// Track ids that are imported by chunks so we don't inline scripts that are imported
			const importedIds = new Set<string>();
			for (const output of outputs) {
				if (output.type === 'chunk') {
					for (const id of output.imports) {
						importedIds.add(id);
					}
				}
			}

			for (const output of outputs) {
				// Try to inline scripts that don't import anything as is within the inline limit
				if (
					output.type === 'chunk' &&
					output.facadeModuleId &&
					internals.discoveredScripts.has(output.facadeModuleId) &&
					!importedIds.has(output.fileName) &&
					output.imports.length === 0 &&
					output.dynamicImports.length === 0 &&
					shouldInlineAsset(output.code, output.fileName, assetInlineLimit)
				) {
					internals.inlinedScripts.set(output.facadeModuleId, output.code.trim());
					delete bundle[output.fileName];
				}
			}
		},
	};
}

export function pluginScripts(internals: BuildInternals): AstroBuildPlugin {
	return {
		targets: ['client'],
		hooks: {
			'build:before': () => {
				return {
					vitePlugin: vitePluginScripts(internals),
				};
			},
		},
	};
}

import type { Plugin as VitePlugin } from 'vite';
import type { AstroBuildPlugin } from '../plugin.js';
import { extendManualChunks } from './util.js';

export function vitePluginChunks(): VitePlugin {
	return {
		name: 'astro:chunks',
		outputOptions(outputOptions) {
			extendManualChunks(outputOptions, {
				after(id) {
					// Place Astro's server runtime in a single `astro/server.mjs` file
					if (id.includes('astro/dist/runtime/server/')) {
						return 'astro/server';
					}
					// Split the Astro runtime into a separate chunk for readability
					if (id.includes('astro/dist/runtime')) {
						return 'astro';
					}
				},
			});
		},
	};
}

// Build plugin that configures specific chunking behavior
export function pluginChunks(): AstroBuildPlugin {
	return {
		targets: ['server'],
		hooks: {
			'build:before': () => {
				return {
					vitePlugin: vitePluginChunks(),
				};
			},
		},
	};
}

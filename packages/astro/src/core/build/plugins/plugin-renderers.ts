import type { Plugin as VitePlugin } from 'vite';
import { addRollupInput } from '../add-rollup-input.js';
import type { AstroBuildPlugin } from '../plugin.js';
import type { StaticBuildOptions } from '../types.js';

export const RENDERERS_MODULE_ID = '@astro-renderers';
export const RESOLVED_RENDERERS_MODULE_ID = `\0${RENDERERS_MODULE_ID}`;

export function vitePluginRenderers(opts: StaticBuildOptions): VitePlugin {
	return {
		name: '@astro/plugin-renderers',

		options(options) {
			return addRollupInput(options, [RENDERERS_MODULE_ID]);
		},

		resolveId(id) {
			if (id === RENDERERS_MODULE_ID) {
				return RESOLVED_RENDERERS_MODULE_ID;
			}
		},

		async load(id) {
			if (id === RESOLVED_RENDERERS_MODULE_ID) {
				if (opts.settings.renderers.length > 0) {
					const imports: string[] = [];
					const exports: string[] = [];
					let i = 0;
					let rendererItems = '';

					for (const renderer of opts.settings.renderers) {
						const variable = `_renderer${i}`;
						imports.push(`import ${variable} from ${JSON.stringify(renderer.serverEntrypoint)};`);
						rendererItems += `Object.assign(${JSON.stringify(renderer)}, { ssr: ${variable} }),`;
						i++;
					}

					exports.push(`export const renderers = [${rendererItems}];`);

					return `${imports.join('\n')}\n${exports.join('\n')}`;
				} else {
					return `export const renderers = [];`;
				}
			}
		},
	};
}

export function pluginRenderers(opts: StaticBuildOptions): AstroBuildPlugin {
	return {
		targets: ['server'],
		hooks: {
			'build:before': () => {
				return {
					vitePlugin: vitePluginRenderers(opts),
				};
			},
		},
	};
}

import type { Plugin as VitePlugin } from 'vite';
import type { BuildInternals } from '../internal.js';
import type { AstroBuildPlugin } from '../plugin.js';

export const astroEntryPrefix = '\0astro-entry:';

/**
 * When adding hydrated or client:only components as Rollup inputs, sometimes we're not using all
 * of the export names, e.g. `import { Counter } from './ManyComponents.jsx'`. This plugin proxies
 * entries to re-export only the names the user is using.
 */
export function vitePluginComponentEntry(internals: BuildInternals): VitePlugin {
	const componentToExportNames = new Map<string, string[]>();

	mergeComponentExportNames(internals.discoveredHydratedComponents);
	mergeComponentExportNames(internals.discoveredClientOnlyComponents);

	for (const [componentId, exportNames] of componentToExportNames) {
		// If one of the imports has a dot, it's a namespaced import, e.g. `import * as foo from 'foo'`
		// and `<foo.Counter />`, in which case we re-export `foo` entirely and we don't need to handle
		// it in this plugin as it's default behaviour from Rollup.
		if (exportNames.some((name) => name.includes('.') || name === '*')) {
			componentToExportNames.delete(componentId);
		} else {
			componentToExportNames.set(componentId, Array.from(new Set(exportNames)));
		}
	}

	function mergeComponentExportNames(components: Map<string, string[]>) {
		for (const [componentId, exportNames] of components) {
			if (componentToExportNames.has(componentId)) {
				componentToExportNames.get(componentId)?.push(...exportNames);
			} else {
				componentToExportNames.set(componentId, exportNames);
			}
		}
	}

	return {
		name: '@astro/plugin-component-entry',
		enforce: 'pre',
		config(config) {
			const rollupInput = config.build?.rollupOptions?.input;
			// Astro passes an array of inputs by default. Even though other Vite plugins could
			// change this to an object, it shouldn't happen in practice as our plugin runs first.
			if (Array.isArray(rollupInput)) {
				// @ts-expect-error input is definitely defined here, but typescript thinks it doesn't
				config.build.rollupOptions.input = rollupInput.map((id) => {
					if (componentToExportNames.has(id)) {
						return astroEntryPrefix + id;
					} else {
						return id;
					}
				});
			}
		},
		async resolveId(id) {
			if (id.startsWith(astroEntryPrefix)) {
				return id;
			}
		},
		async load(id) {
			if (id.startsWith(astroEntryPrefix)) {
				const componentId = id.slice(astroEntryPrefix.length);
				const exportNames = componentToExportNames.get(componentId);
				if (exportNames) {
					return `export { ${exportNames.join(', ')} } from ${JSON.stringify(componentId)}`;
				}
			}
		},
	};
}

export function normalizeEntryId(id: string): string {
	return id.startsWith(astroEntryPrefix) ? id.slice(astroEntryPrefix.length) : id;
}

export function pluginComponentEntry(internals: BuildInternals): AstroBuildPlugin {
	return {
		targets: ['client'],
		hooks: {
			'build:before': () => {
				return {
					vitePlugin: vitePluginComponentEntry(internals),
				};
			},
		},
	};
}

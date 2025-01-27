import type { ModuleInfo } from '../core/module-loader/index.js';
import type { PluginMetadata } from './types.js';

export function getAstroMetadata(modInfo: ModuleInfo): PluginMetadata['astro'] | undefined {
	if (modInfo.meta?.astro) {
		return modInfo.meta.astro as PluginMetadata['astro'];
	}
	return undefined;
}

export function createDefaultAstroMetadata(): PluginMetadata['astro'] {
	return {
		hydratedComponents: [],
		clientOnlyComponents: [],
		serverComponents: [],
		scripts: [],
		propagation: 'none',
		containsHead: false,
		pageOptions: {},
	};
}

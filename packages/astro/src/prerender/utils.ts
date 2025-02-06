import { getOutDirWithinCwd } from '../core/build/common.js';
import type { AstroSettings } from '../types/astro.js';
import type { AstroConfig } from '../types/public/config.js';

export function getPrerenderDefault(config: AstroConfig) {
	return config.output !== 'server';
}

/**
 * Returns the correct output directory of the SSR build based on the configuration
 */
export function getServerOutputDirectory(settings: AstroSettings): URL {
	if (settings.buildOutput === 'server') {
		return settings.config.build.server;
	} else {
		return getOutDirWithinCwd(settings.config.outDir);
	}
}

/**
 * Returns the correct output directory of the client build based on the configuration
 */
export function getClientOutputDirectory(settings: AstroSettings): URL {
	return settings.buildOutput === 'server' ? settings.config.build.client : settings.config.outDir;
}

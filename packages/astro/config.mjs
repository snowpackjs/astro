export { defineConfig, getViteConfig } from './dist/config/index.js';
export { mergeConfig } from './dist/core/config/merge.js'
export { validateConfig } from './dist/core/config/validate.js'
export { envField } from './dist/env/config.js';

export function sharpImageService(config = {}) {
	return {
		entrypoint: 'astro/assets/services/sharp',
		config,
	};
}

export function squooshImageService() {
	return {
		entrypoint: 'astro/assets/services/squoosh',
		config: {},
	};
}

export function passthroughImageService() {
	return {
		entrypoint: 'astro/assets/services/noop',
		config: {},
	};
}

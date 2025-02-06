// IMPORTANT: this file is the entrypoint for "astro/config". Keep it as light as possible!

import type { SharpImageServiceConfig } from '../assets/services/sharp.js';
import type { ImageServiceConfig } from '../types/public/index.js';

export { defineConfig, getViteConfig } from './index.js';
export { envField } from '../env/config.js';

/**
 * Return the configuration needed to use the Sharp-based image service
 */
export function sharpImageService(config: SharpImageServiceConfig = {}): ImageServiceConfig {
	return {
		entrypoint: 'astro/assets/services/sharp',
		config,
	};
}

/**
 * Return the configuration needed to use the passthrough image service. This image services does not perform
 * any image transformations, and is mainly useful when your platform does not support other image services, or you are
 * not using Astro's built-in image processing.
 * See: https://docs.astro.build/en/guides/images/#configure-no-op-passthrough-service
 */
export function passthroughImageService(): ImageServiceConfig {
	return {
		entrypoint: 'astro/assets/services/noop',
		config: {},
	};
}

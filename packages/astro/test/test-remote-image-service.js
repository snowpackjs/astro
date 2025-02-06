import { fileURLToPath } from 'node:url';
import { baseService } from '../dist/assets/services/service.js';

/**
 * stub remote image service
 * @param {{ foo?: string }} [config]
 */
export function testRemoteImageService(config = {}) {
	return {
		entrypoint: fileURLToPath(import.meta.url),
		config,
	};
}

/** @type {import("../dist/types/public/index.js").LocalImageService} */
export default {
	...baseService,
	propertiesToHash: [...baseService.propertiesToHash, 'data-custom'],
	getHTMLAttributes(options, serviceConfig) {
		options['data-service'] = 'my-custom-service';
		if (serviceConfig.service.config.foo) {
			options['data-service-config'] = serviceConfig.service.config.foo;
		}
		return baseService.getHTMLAttributes(options);
	},
};

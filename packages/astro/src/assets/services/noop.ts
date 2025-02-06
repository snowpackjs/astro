import { type LocalImageService, baseService } from './service.js';

// Empty service used for platforms that don't support Sharp / users who don't want transformations.
const noopService: LocalImageService = {
	...baseService,
	propertiesToHash: ['src'],
	async transform(inputBuffer, transformOptions) {
		return {
			data: inputBuffer,
			format: transformOptions.format,
		};
	},
};

export default noopService;

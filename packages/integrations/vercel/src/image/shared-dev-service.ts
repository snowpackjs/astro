import type { LocalImageService } from 'astro';
import { baseService } from 'astro/assets';
import { sharedValidateOptions } from './shared.js';

export const baseDevService: Omit<LocalImageService, 'transform'> = {
	...baseService,
	validateOptions: (options, serviceOptions) =>
		sharedValidateOptions(options, serviceOptions.service.config, 'development'),
	getURL(options) {
		const fileSrc = typeof options.src === 'string' ? options.src : options.src.src;

		const searchParams = new URLSearchParams();
		searchParams.append('href', fileSrc);

		options.width && searchParams.append('w', options.width.toString());
		options.quality && searchParams.append('q', options.quality.toString());

		return '/_image?' + searchParams;
	},
	parseURL(url) {
		const params = url.searchParams;

		if (!params.has('href')) {
			return undefined;
		}

		const transform = {
			src: params.get('href')!,
			width: params.has('w') ? Number.parseInt(params.get('w')!) : undefined,
			quality: params.get('q'),
		};

		return transform;
	},
};

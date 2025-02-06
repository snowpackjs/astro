import type { ExternalImageService, ImageMetadata } from 'astro';
import { baseService } from 'astro/assets';
import { AstroError } from 'astro/errors';

const SUPPORTED_FORMATS = ['avif', 'jpg', 'png', 'webp'];
const QUALITY_NAMES: Record<string, number> = { low: 25, mid: 50, high: 90, max: 100 };

export function isESMImportedImage(src: ImageMetadata | string): src is ImageMetadata {
	return typeof src === 'object';
}

function removeLeadingForwardSlash(path: string) {
	return path.startsWith('/') ? path.substring(1) : path;
}

const service: ExternalImageService = {
	getURL(options) {
		const query = new URLSearchParams();

		const fileSrc = isESMImportedImage(options.src)
			? removeLeadingForwardSlash(options.src.src)
			: options.src;

		query.set('url', fileSrc);

		if (options.format) query.set('fm', options.format);
		if (options.width) query.set('w', `${options.width}`);
		if (options.height) query.set('h', `${options.height}`);
		if (options.quality) query.set('q', `${options.quality}`);

		return `/.netlify/images?${query}`;
	},
	getHTMLAttributes: baseService.getHTMLAttributes,
	getSrcSet: baseService.getSrcSet,
	validateOptions(options) {
		if (options.format && !SUPPORTED_FORMATS.includes(options.format)) {
			throw new AstroError(
				`Unsupported image format "${options.format}"`,
				`Use one of ${SUPPORTED_FORMATS.join(', ')} instead.`,
			);
		}

		if (options.quality) {
			options.quality =
				typeof options.quality === 'string' ? QUALITY_NAMES[options.quality] : options.quality;
			if (options.quality < 1 || options.quality > 100) {
				throw new AstroError(
					`Invalid quality for picture "${options.src}"`,
					'Quality needs to be between 1 and 100.',
				);
			}
		}
		return options;
	},
};

export default service;

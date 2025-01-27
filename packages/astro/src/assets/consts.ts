export const VIRTUAL_MODULE_ID = 'astro:assets';
export const VIRTUAL_SERVICE_ID = 'virtual:image-service';
export const VALID_INPUT_FORMATS = [
	'jpeg',
	'jpg',
	'png',
	'tiff',
	'webp',
	'gif',
	'svg',
	'avif',
] as const;
/**
 * Valid formats that our base services support.
 * Certain formats can be imported (namely SVGs) but will not be processed.
 */
export const VALID_SUPPORTED_FORMATS = [
	'jpeg',
	'jpg',
	'png',
	'tiff',
	'webp',
	'gif',
	'svg',
	'avif',
] as const;
export const DEFAULT_OUTPUT_FORMAT = 'webp' as const;
export const VALID_OUTPUT_FORMATS = ['avif', 'png', 'webp', 'jpeg', 'jpg', 'svg'] as const;
export const DEFAULT_HASH_PROPS = [
	'src',
	'width',
	'height',
	'format',
	'quality',
	'fit',
	'position',
];

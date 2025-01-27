import type { ImageInputFormat, ImageMetadata } from '../types.js';

export function getOrigQueryParams(
	params: URLSearchParams,
): Pick<ImageMetadata, 'width' | 'height' | 'format'> | undefined {
	const width = params.get('origWidth');
	const height = params.get('origHeight');
	const format = params.get('origFormat');

	if (!width || !height || !format) {
		return undefined;
	}

	return {
		width: parseInt(width),
		height: parseInt(height),
		format: format as ImageInputFormat,
	};
}

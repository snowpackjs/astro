import type { ImageMetadata, UnresolvedImageTransform } from '../types.js';

export function isESMImportedImage(src: ImageMetadata | string): src is ImageMetadata {
	return typeof src === 'object' || (typeof src === 'function' && 'src' in src);
}

export function isRemoteImage(src: ImageMetadata | string): src is string {
	return typeof src === 'string';
}

export async function resolveSrc(src: UnresolvedImageTransform['src']) {
	return typeof src === 'object' && 'then' in src ? ((await src).default ?? (await src)) : src;
}

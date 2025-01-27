import type { AssetsPrefix } from '../../core/app/types.js';

export function getAssetsPrefix(fileExtension: string, assetsPrefix?: AssetsPrefix): string {
	if (!assetsPrefix) return '';
	if (typeof assetsPrefix === 'string') return assetsPrefix;
	// we assume the file extension has a leading '.' and we remove it
	const dotLessFileExtension = fileExtension.slice(1);
	if (assetsPrefix[dotLessFileExtension]) {
		return assetsPrefix[dotLessFileExtension];
	}
	return assetsPrefix.fallback;
}

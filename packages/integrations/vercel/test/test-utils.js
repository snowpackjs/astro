import { loadFixture as baseLoadFixture } from '../../../astro/test/test-utils.js';
export { fixLineEndings } from '../../../astro/test/test-utils.js';

export function loadFixture(config) {
	if (config?.root) {
		config.root = new URL(config.root, import.meta.url);
	}
	return baseLoadFixture(config);
}

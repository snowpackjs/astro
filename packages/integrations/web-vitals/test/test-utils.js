import { loadFixture as baseLoadFixture } from '../../../astro/test/test-utils.js';

/** @typedef {import('../../../astro/test/test-utils').Fixture} Fixture */
/** @typedef {import('../../../astro/test/test-utils').DevServer} DevServer */

/** @type {typeof import('../../../astro/test/test-utils.js')['loadFixture']} */
export function loadFixture(inlineConfig) {
	if (!inlineConfig?.root) throw new Error("Must provide { root: './fixtures/...' }");

	// resolve the relative root (i.e. "./fixtures/tailwindcss") to a full filepath
	// without this, the main `loadFixture` helper will resolve relative to `packages/astro/test`
	return baseLoadFixture({
		...inlineConfig,
		root: new URL(inlineConfig.root, import.meta.url).toString(),
	});
}

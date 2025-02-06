import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from '../../../astro/test/test-utils.js';

describe('Basic', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/basic/', import.meta.url),
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('works', async () => {
			const astroChunkDir = await fixture.readdir('/_astro');

			let css = '';
			for (const file of astroChunkDir) {
				if (file.endsWith('.css')) {
					css += await fixture.readFile(`/_astro/${file}`);
				}
			}

			assert.equal(css.includes('box-sizing:border-box;'), true); // base css
			assert.equal(css.includes('text-red-500'), true); // class css
			assert.equal(
				new RegExp(/\.a\[data-astro-cid-.*?\] \.b\[data-astro-cid-.*?\]/).test(css),
				true,
			); // nesting
		});
	});
});

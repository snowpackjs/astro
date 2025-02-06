import mdx from '@astrojs/mdx';

import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from '../../../astro/test/test-utils.js';

describe('MDX Infinite Loop', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/mdx-infinite-loop/', import.meta.url),
			integrations: [mdx()],
		});
	});

	describe('build', () => {
		let err;
		before(async () => {
			try {
				await fixture.build();
			} catch (e) {
				err = e;
			}
		});

		it('does not hang forever if an error is thrown', async () => {
			assert.equal(!!err, true);
		});
	});
});

import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from '../../../astro/test/test-utils.js';
import mdx from '../dist/index.js';

const FIXTURE_ROOT = new URL('./fixtures/invalid-mdx-component/', import.meta.url);

describe('MDX component with runtime error', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: FIXTURE_ROOT,
			integrations: [mdx()],
		});
	});

	describe('build', () => {
		/** @type {Error | null} */
		let error;

		before(async () => {
			error = null;
			try {
				await fixture.build();
			} catch (e) {
				error = e;
			}
		});

		it('Throws the right error', async () => {
			assert.ok(error);
			assert.match(
				error?.hint,
				/This issue often occurs when your MDX component encounters runtime errors/,
			);
		});
	});
});

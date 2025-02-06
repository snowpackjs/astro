import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('SSR Assets', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/ssr-assets/',
			output: 'server',
			adapter: testAdapter(),
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
		await fixture.build();
	});

	it('Do not have to implement getStaticPaths', async () => {
		const app = await fixture.loadTestAdapterApp();
		/** @type {Set<string>} */
		const assets = app.manifest.assets;
		assert.equal(assets.size, 1);
		assert.equal(Array.from(assets)[0].endsWith('.css'), true);
	});
});

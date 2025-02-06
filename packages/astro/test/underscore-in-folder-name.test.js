import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Projects with a underscore in the folder name', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/_underscore in folder name/',
			output: 'static',
			adapter: testAdapter(),
		});
		await fixture.build();
	});

	it('includes page from node_modules/fake-astro-library', async () => {
		const app = await fixture.loadTestAdapterApp();
		/** @type {Set<string>} */
		const assets = app.manifest.assets;
		assert.equal(assets.has('/index.html'), true);
		assert.equal(assets.has('/404.html'), true);
	});
});

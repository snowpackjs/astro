import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('assets dir takes the URL path inside the output directory', () => {
	/** @type {URL} */
	let checkDir;
	before(async () => {
		const fixture = await loadFixture({
			root: './fixtures/astro-assets-dir/',
			build: {
				assets: 'custom_dir_1',
			},
			integrations: [
				{
					name: '@astrojs/dir',
					hooks: {
						'astro:build:done': ({ dir }) => {
							checkDir = dir;
						},
					},
				},
			],
		});
		await fixture.build();
	});
	it('generates the assets directory as per build.assets configuration', async () => {
		const removeTrailingSlash = (str) => str.replace(/\/$/, '');
		assert.equal(
			removeTrailingSlash(new URL('./custom_dir_1', checkDir).toString()),
			removeTrailingSlash(
				new URL('./fixtures/astro-assets-dir/dist/custom_dir_1', import.meta.url).toString(),
			),
		);
	});
});

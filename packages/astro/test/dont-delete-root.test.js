import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('outDir set to project root', async () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	/** @type {Error | undefined} */
	let error;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/dont-delete-me/' });
		try {
			await fixture.build();
		} catch (err) {
			error = err;
		}
	});

	it('Throws an error when you attempt to build', async () => {
		assert.equal(error instanceof Error, true);
		assert.match(error.message, /outDir cannot be the root folder/);
	});

	it('Files have not been deleted', async () => {
		const expectedFiles = ['package.json', 'astro.config.mjs', 'src/pages/index.astro'];

		for (const rel of expectedFiles) {
			const root = new URL('./fixtures/dont-delete-me/', import.meta.url);
			const url = new URL('./' + rel, root);
			const stats = await fs.promises.stat(url);
			assert.notEqual(stats, undefined);
		}
	});
});

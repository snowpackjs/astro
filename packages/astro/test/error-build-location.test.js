import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Errors information in build', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	it('includes the file where the error happened', async () => {
		fixture = await loadFixture({
			root: './fixtures/error-build-location',
		});

		let errorContent;
		try {
			await fixture.build();
		} catch (e) {
			errorContent = e;
		}

		assert.equal(errorContent.id, 'src/pages/index.astro');
	});
});

import { expect } from 'chai';
import { loadFixture } from './test-utils.js';

describe('Errors information in build', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	it('Does not crash the dev server', async () => {
		fixture = await loadFixture({
			root: './fixtures/error-build-location',
		});

		let errorContent;
		try {
			await fixture.build();
		} catch (e) {
			errorContent = e;
		}

		expect(errorContent.id).to.equal('src/pages/index.astro');
	});
});

import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { testImageService } from './test-image-service.js';
import { loadFixture } from './test-utils.js';

describe('astro:assets - delete images that are unused', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	describe('build ssg', () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image-deletion/',
				image: {
					service: testImageService(),
				},
			});

			await fixture.build();
		});

		it('should delete images that are only used for optimization', async () => {
			const imagesOnlyOptimized = await fixture.glob('_astro/onlyone.*.*');
			assert.equal(imagesOnlyOptimized.length, 1);
		});

		it('should not delete images that are used in other contexts', async () => {
			const imagesUsedElsewhere = await fixture.glob('_astro/twoofus.*.*');
			assert.equal(imagesUsedElsewhere.length, 2);
		});

		it('should not delete images that are also used through query params', async () => {
			const imagesUsedElsewhere = await fixture.glob('_astro/url.*.*');
			assert.equal(imagesUsedElsewhere.length, 2);
		});

		it('should delete MDX images only used for optimization', async () => {
			const imagesOnlyOptimized = await fixture.glob('_astro/mdxDontExist.*.*');
			assert.equal(imagesOnlyOptimized.length, 1);
		});

		it('should always keep Markdoc images', async () => {
			const imagesUsedElsewhere = await fixture.glob('_astro/markdocStillExists.*.*');
			assert.equal(imagesUsedElsewhere.length, 2);
		});
	});
});

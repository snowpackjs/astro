import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const VERCEL_TEST_URL = 'https://astro-vercel-image-test.vercel.app';

describe('Hosted Vercel Tests', () => {
	it('Image endpoint works', async () => {
		const image = await fetch(
			// biome-ignore lint/style/useTemplate: <explanation>
			VERCEL_TEST_URL + '/_image?href=%2F_astro%2Fpenguin.e9c64733.png&w=300&f=webp'
		);

		assert.equal(image.status, 200);
	});
});

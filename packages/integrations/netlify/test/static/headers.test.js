import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from '../../../../astro/test/test-utils.js';

describe('SSG - headers', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: new URL('./fixtures/redirects/', import.meta.url) });
		await fixture.build();
	});

	it('Generates headers for static assets', async () => {
		const config = await fixture.readFile('../.netlify/v1/config.json');
		const headers = JSON.parse(config).headers;
		assert.deepEqual(headers, [
			{
				for: '/_astro/*',
				values: {
					'Cache-Control': 'public, max-age=31536000, immutable',
				},
			},
		]);
	});
});

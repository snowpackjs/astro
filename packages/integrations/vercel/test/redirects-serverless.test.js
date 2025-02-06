import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Redirects Serverless', () => {
	/** @type {import('astro/test/test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/redirects-serverless/',
			redirects: {
				'/one': '/',
				'/other': '/subpage',
			},
		});
		await fixture.build();
	});

	it('does not create .html files', async () => {
		let hasErrored = false;
		try {
			await fixture.readFile('../.vercel/output/static/other/index.html');
		} catch {
			hasErrored = true;
		}
		assert.equal(hasErrored, true, 'this file should not exist');
	});
});

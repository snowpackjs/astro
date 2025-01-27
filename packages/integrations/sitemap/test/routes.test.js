import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture, readXML } from './test-utils.js';

describe('routes', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;
	/** @type {string[]} */
	let urls;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/static/',
		});
		await fixture.build();
		const data = await readXML(fixture.readFile('/sitemap-0.xml'));
		urls = data.urlset.url.map((url) => url.loc[0]);
	});

	it('does not include endpoints', async () => {
		assert.equal(urls.includes('http://example.com/endpoint.json'), false);
	});

	it('does not include redirects', async () => {
		assert.equal(urls.includes('http://example.com/redirect'), false);
	});
});

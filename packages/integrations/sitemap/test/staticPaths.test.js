import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture, readXML } from './test-utils.js';

describe('getStaticPaths support', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;
	/** @type {string[]} */
	let urls;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/static/',
			trailingSlash: 'always',
		});
		await fixture.build();

		const data = await readXML(fixture.readFile('/sitemap-0.xml'));
		urls = data.urlset.url.map((url) => url.loc[0]);
	});

	it('requires zero config for getStaticPaths', async () => {
		assert.equal(urls.includes('http://example.com/one/'), true);
		assert.equal(urls.includes('http://example.com/two/'), true);
	});

	it('does not include 404 pages', () => {
		assert.equal(urls.includes('http://example.com/404/'), false);
	});

	it('does not include nested 404 pages', () => {
		assert.equal(urls.includes('http://example.com/de/404/'), false);
	});

	it('includes numerical pages', () => {
		assert.equal(urls.includes('http://example.com/123/'), true);
	});

	it('includes numerical 404 pages if not for i18n', () => {
		assert.equal(urls.includes('http://example.com/products-by-id/405/'), true);
		assert.equal(urls.includes('http://example.com/products-by-id/404/'), true);
	});

	it('should render the endpoint', async () => {
		const page = await fixture.readFile('./it/manifest');
		assert.match(page, /I'm a route in the "it" language./);
	});
});

import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Dynamic route collision', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/dynamic-route-collision',
		});

		await fixture.build().catch(console.log);
	});

	it('Builds a static route when in conflict with a dynamic route', async () => {
		const html = await fixture.readFile('/about/index.html');
		const $ = cheerio.load(html);
		assert.equal($('h1').text(), 'Static About');
	});

	it('Builds a static nested index when in conflict with a dynamic route with slug with leading slash', async () => {
		const html = await fixture.readFile('/test/index.html');
		const $ = cheerio.load(html);
		assert.equal($('h1').text(), 'Static Test');
	});

	it('Builds a static route when in conflict with a spread route', async () => {
		const html = await fixture.readFile('/who/index.html');
		const $ = cheerio.load(html);
		assert.equal($('h1').text(), 'Static Who We Are');
	});

	it('Builds a static nested index when in conflict with a spread route', async () => {
		const html = await fixture.readFile('/tags/index.html');
		const $ = cheerio.load(html);
		assert.equal($('h1').text(), 'Static Tags Index');
	});

	it('Builds a static nested index when in conflict with a spread route with slug with leading slash', async () => {
		const html = await fixture.readFile('/test/ing/index.html');
		const $ = cheerio.load(html);
		assert.equal($('h1').text(), 'Static TestIng');
	});

	it('Builds a static root index when in conflict with a spread route', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		assert.equal($('h1').text(), 'Static Index');
	});

	it('Builds a static index a nested when in conflict with a dynamic+spread route', async () => {
		const html = await fixture.readFile('/en/index.html');
		const $ = cheerio.load(html);
		assert.equal($('h1').text(), 'Dynamic-only Localized Index');
	});

	it('Builds a dynamic route when in conflict with a spread route', async () => {
		const html = await fixture.readFile('/blog/index.html');
		const $ = cheerio.load(html);
		assert.equal($('h1').text(), 'Dynamic Blog');
	});

	it('Builds the highest priority route out of two conflicting dynamic routes', async () => {
		const html = await fixture.readFile('/order/index.html');
		const $ = cheerio.load(html);
		assert.equal($('h1').text(), 'Order from A');
	});
});

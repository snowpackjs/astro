import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Custom 404 with Static', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/custom-404-static/',
			site: 'http://example.com',
		});
	});

	describe('dev', () => {
		let devServer;
		let $;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('renders /', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			$ = cheerio.load(html);

			assert.equal($('h1').text(), 'Home');
		});

		it('renders 404 for /a', async () => {
			const res = await fixture.fetch('/a');
			assert.equal(res.status, 404);

			const html = await res.text();
			$ = cheerio.load(html);

			assert.equal($('h1').text(), 'Page not found');
			assert.equal($('p').text(), '/a');
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('builds to 404.html', async () => {
			const html = await fixture.readFile('/404.html');
			assert.ok(html);
		});
	});
});

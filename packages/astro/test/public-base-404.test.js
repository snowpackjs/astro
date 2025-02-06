import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Public dev with base', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let $;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/public-base-404/',
			site: 'http://example.com/',
			base: '/blog',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('200 when loading /@vite/client', async () => {
		const response = await fixture.fetch('/@vite/client', {
			redirect: 'manual',
		});
		assert.equal(response.status, 200);
		const content = await response.text();
		assert.equal(content.includes('vite'), true);
	});

	it('200 when loading /blog/twitter.png', async () => {
		const response = await fixture.fetch('/blog/twitter.png', {
			redirect: 'manual',
		});
		assert.equal(response.status, 200);
	});

	it('custom 404 page when loading /blog/blog/', async () => {
		const response = await fixture.fetch('/blog/blog/');
		const html = await response.text();
		$ = cheerio.load(html);
		assert.equal($('h1').text(), '404');
	});

	it('default 404 hint page when loading /', async () => {
		const response = await fixture.fetch('/');
		assert.equal(response.status, 404);
		const html = await response.text();
		$ = cheerio.load(html);
		assert.equal($('a').first().text(), '/blog');
	});

	it('default 404 page when loading /none/', async () => {
		const response = await fixture.fetch('/none/', {
			headers: {
				accept: 'text/html,*/*',
			},
		});
		assert.equal(response.status, 404);
		const html = await response.text();
		$ = cheerio.load(html);
		assert.equal($('h1').text(), '404:  Not found');
		assert.equal($('pre').text(), 'Path: /none/');
	});
});

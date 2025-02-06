import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

// DEV
describe('Dev server manual routing', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	/** @type {import('./test-utils').DevServer} */
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/i18n-routing-manual-with-default-middleware/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('should return a 404', async () => {
		const response = await fixture.fetch('/blog');
		const text = await response.text();
		assert.equal(response.status, 404);
		assert.match(text, /Blog should not render/);
	});

	it('should return a 200 because the custom middleware allows it', async () => {
		const response = await fixture.fetch('/about');
		assert.equal(response.status, 200);
		const text = await response.text();
		assert.equal(text.includes('ABOUT ME'), true);
	});

	it('should correctly print the relative locale url', async () => {
		const response = await fixture.fetch('/en/start');
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.equal($('p').text(), '/en/blog/title/');
	});
});
//
// // SSG
describe('SSG manual routing', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/i18n-routing-manual-with-default-middleware/',
		});
		await fixture.build();
	});

	it('should return a 404', async () => {
		try {
			await fixture.readFile('/blog.html');
			assert.fail();
		} catch {}
	});

	it('should return a 200 because the custom middleware allows it', async () => {
		let html = await fixture.readFile('/about/index.html');
		let $ = cheerio.load(html);
		assert.equal($('body').text().includes('ABOUT ME'), true);
	});

	it('should correctly print the relative locale url', async () => {
		const html = await fixture.readFile('/en/start/index.html');
		const $ = cheerio.load(html);
		assert.equal($('p').text(), '/en/blog/title/');
	});
});

// // SSR
describe('SSR manual routing', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let app;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/i18n-routing-manual-with-default-middleware/',
			output: 'server',
			adapter: testAdapter(),
		});
		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it('should return a 404', async () => {
		let request = new Request('http://example.com/blog');
		let response = await app.render(request);
		assert.equal(response.status, 404);
		const text = await response.text();
		assert.match(text, /Blog should not render/);
	});

	it('should return a 200 because the custom middleware allows it', async () => {
		let request = new Request('http://example.com/about');
		let response = await app.render(request);
		assert.equal(response.status, 200);
		const text = await response.text();
		assert.equal(text.includes('ABOUT ME'), true);
	});

	it('should correctly print the relative locale url', async () => {
		let request = new Request('http://example.com/en/start');
		let response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.equal($('p').text(), '/en/blog/title/');
	});

	it('should use the fallback', async () => {
		let request = new Request('http://example.com/it/start');
		let response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.equal($('p').text(), '/en/blog/title/');
	});
});

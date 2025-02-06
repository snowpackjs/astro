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
			root: './fixtures/i18n-routing-manual/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('should redirect to the default locale when middleware calls the function for route /', async () => {
		const response = await fixture.fetch('/');
		assert.equal(response.status, 200);
		const text = await response.text();
		assert.equal(text.includes('Hello'), true);
	});

	it('should render a route that is not related to the i18n routing', async () => {
		const response = await fixture.fetch('/help');
		assert.equal(response.status, 200);
		const text = await response.text();
		assert.equal(text.includes('Outside route'), true);
	});

	it('should render a i18n route', async () => {
		let response = await fixture.fetch('/en/blog');
		assert.equal(response.status, 200);
		let text = await response.text();
		assert.equal(text.includes('Blog start'), true);

		response = await fixture.fetch('/pt/start');
		assert.equal(response.status, 200);
		text = await response.text();
		assert.equal(text.includes('Oi'), true);

		response = await fixture.fetch('/spanish');
		assert.equal(response.status, 200);
		text = await response.text();
		assert.equal(text.includes('Hola.'), true);
	});

	it('should call the middleware for 404.astro pages', async () => {
		const response = await fixture.fetch('/redirect-me');
		assert.equal(response.status, 200);
	});
});

// SSG
describe('SSG manual routing', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/i18n-routing-manual/',
		});
		await fixture.build();
	});

	it('should redirect to the default locale when middleware calls the function for route /', async () => {
		let html = await fixture.readFile('/index.html');
		assert.equal(html.includes('http-equiv="refresh'), true);
		assert.equal(html.includes('url=/en'), true);
	});

	it('should render a route that is not related to the i18n routing', async () => {
		let html = await fixture.readFile('/help/index.html');
		let $ = cheerio.load(html);
		assert.equal($('body').text().includes('Outside route'), true);
	});

	it('should render a i18n route', async () => {
		let html = await fixture.readFile('/en/blog/index.html');
		let $ = cheerio.load(html);
		assert.equal($('body').text().includes('Blog start'), true);

		html = await fixture.readFile('/pt/start/index.html');
		$ = cheerio.load(html);
		assert.equal($('body').text().includes('Oi'), true);

		html = await fixture.readFile('/spanish/index.html');
		$ = cheerio.load(html);
		assert.equal($('body').text().includes('Hola.'), true);
	});
});

// SSR
describe('SSR manual routing', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let app;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/i18n-routing-manual/',
			output: 'server',
			adapter: testAdapter(),
		});
		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it('should redirect to the default locale when middleware calls the function for route /', async () => {
		let request = new Request('http://example.com/');
		let response = await app.render(request);
		assert.equal(response.status, 302);
	});

	it('should render a route that is not related to the i18n routing', async () => {
		let request = new Request('http://example.com/help');
		let response = await app.render(request);
		assert.equal(response.status, 200);
		const text = await response.text();
		assert.equal(text.includes('Outside route'), true);
	});

	it('should render a i18n route', async () => {
		let request = new Request('http://example.com/en/blog');
		let response = await app.render(request);
		assert.equal(response.status, 200);
		let text = await response.text();
		assert.equal(text.includes('Blog start'), true);

		request = new Request('http://example.com/pt/start');
		response = await app.render(request);
		assert.equal(response.status, 200);
		text = await response.text();
		assert.equal(text.includes('Oi'), true);

		request = new Request('http://example.com/spanish');
		response = await app.render(request);
		assert.equal(response.status, 200);
		text = await response.text();
		assert.equal(text.includes('Hola.'), true);
	});
});

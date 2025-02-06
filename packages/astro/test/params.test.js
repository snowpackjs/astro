import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Astro.params in SSR', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/ssr-params/',
			adapter: testAdapter(),
			output: 'server',
			base: '/users/houston/',
		});
		await fixture.build();
	});

	it('Params are passed to component', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/users/houston/food');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.equal($('.category').text(), 'food');
	});

	describe('Non-english characters in the URL', () => {
		it('Params are passed to component', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/users/houston/東西/food');
			const response = await app.render(request);
			assert.equal(response.status, 200);
			const html = await response.text();
			const $ = cheerio.load(html);
			assert.equal($('.category').text(), 'food');
		});
	});

	it('It uses encodeURI/decodeURI to decode parameters', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/users/houston/[page]');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.equal($('.category').text(), '[page]');
	});

	it('It accepts encoded URLs, and the params decoded', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/users/houston/%5Bpage%5D');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.equal($('.category').text(), '[page]');
	});

	it("It doesn't encode/decode URI characters such as %23 (#)", async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/users/houston/%23something');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.equal($('.category').text(), '%23something');
	});
	it("It doesn't encode/decode URI characters such as %2F (/)", async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/users/houston/%2Fsomething');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.equal($('.category').text(), '%2Fsomething');
	});

	it("It doesn't encode/decode URI characters such as %3F (?)", async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/users/houston/%3Fsomething');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.equal($('.category').text(), '%3Fsomething');
	});
});

describe('Astro.params in  dev mode', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/ssr-params/',
			adapter: testAdapter(),
			output: 'server',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('should handle non-english URLs', async () => {
		const html = await fixture.fetch('/你好').then((res) => res.text());
		const $ = cheerio.load(html);
		assert.equal($('.category').text(), '你好');
	});
});

describe('Astro.params in static mode', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/ssr-params/',
		});
		await fixture.build();
	});

	it('It creates files that have square brackets in their URL', async () => {
		const html = await fixture.readFile(encodeURI('/[page]/index.html'));
		const $ = cheerio.load(html);
		assert.equal($('.category').text(), '[page]');
	});

	it("It doesn't encode/decode URI characters such as %23 (#)", async () => {
		const html = await fixture.readFile(encodeURI('/%23something/index.html'));
		const $ = cheerio.load(html);
		assert.equal($('.category').text(), '%23something');
	});

	it("It doesn't encode/decode URI characters such as %2F (/)", async () => {
		const html = await fixture.readFile(encodeURI('/%2Fsomething/index.html'));
		const $ = cheerio.load(html);
		assert.equal($('.category').text(), '%2Fsomething');
	});

	it("It doesn't encode/decode URI characters such as %3F (?)", async () => {
		const html = await fixture.readFile(encodeURI('/%3Fsomething/index.html'));
		const $ = cheerio.load(html);
		assert.equal($('.category').text(), '%3Fsomething');
	});

	it("It doesn't encode/decode URI characters such as %25 (%)", async () => {
		const html = await fixture.readFile(encodeURI('/%25something/index.html'));
		const $ = cheerio.load(html);
		assert.equal($('.category').text(), '%25something');
	});
});

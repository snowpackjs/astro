import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture, streamAsyncIterator } from './test-utils.js';

describe('Streaming', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	let decoder = new TextDecoder();

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/streaming/',
			adapter: testAdapter(),
			output: 'server',
		});
	});

	describe('Development', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('Body is chunked', async () => {
			let res = await fixture.fetch('/');
			let chunks = [];
			for await (const bytes of streamAsyncIterator(res.body)) {
				let chunk = decoder.decode(bytes);
				chunks.push(chunk);
			}
			assert.equal(chunks.length > 5, true);
		});

		it('Body of slots is chunked', async () => {
			let res = await fixture.fetch('/slot');
			let chunks = [];
			for await (const bytes of streamAsyncIterator(res.body)) {
				let chunk = decoder.decode(bytes);
				chunks.push(chunk);
			}
			assert.ok(chunks.length >= 2);
		});
	});

	describe('Production', () => {
		before(async () => {
			await fixture.build();
		});

		it('Can get the full html body', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/');
			const response = await app.render(request);
			const html = await response.text();
			const $ = cheerio.load(html);
			assert.equal($('header h1').length, 1);
			assert.equal($('ul li').length, 10);
		});

		it('Body is chunked', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/');
			const response = await app.render(request);
			let chunks = [];
			for await (const bytes of streamAsyncIterator(response.body)) {
				let chunk = decoder.decode(bytes);
				chunks.push(chunk);
			}
			assert.equal(chunks.length > 1, true);
		});

		// if the offshoot promise goes unhandled, this test will pass immediately but fail the test suite
		it('Stays alive on failed component renders initiated by failed render templates', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/multiple-errors');
			const response = await app.render(request);
			assert.equal(response.status, 500);
			const text = await response.text();
			assert.equal(text, '');
		});
	});
});

describe('Streaming disabled', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/streaming/',
			adapter: testAdapter(),
			output: 'server',
			server: {
				streaming: false,
			},
		});
	});

	describe('Development', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('Body is chunked', async () => {
			let res = await fixture.fetch('/');
			let chunks = [];
			for await (const bytes of streamAsyncIterator(res.body)) {
				let chunk = bytes.toString('utf-8');
				chunks.push(chunk);
			}
			assert.equal(chunks.length > 1, true);
		});
	});

	// TODO: find a different solution for the test-adapter,
	// currently there's no way to resolve two different versions with one
	// having streaming disabled
	describe('Production', () => {
		before(async () => {
			await fixture.build();
		});

		it('Can get the full html body', async () => {
			const app = await fixture.loadTestAdapterApp(false);
			const request = new Request('http://example.com/');
			const response = await app.render(request);

			assert.equal(response.status, 200);
			assert.equal(response.headers.get('content-type'), 'text/html');
			assert.equal(response.headers.has('content-length'), true);
			assert.equal(parseInt(response.headers.get('content-length')) > 0, true);

			const html = await response.text();
			const $ = cheerio.load(html);

			assert.equal($('header h1').length, 1);
			assert.equal($('ul li').length, 10);
		});
	});
});

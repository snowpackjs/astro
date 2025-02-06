import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import nodejs from '../dist/index.js';
import { loadFixture, waitServerListen } from './test-utils.js';

/**
 * @typedef {import('../../../astro/test/test-utils').Fixture} Fixture
 */

describe('Prerender 404', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let server;

	describe('With base', async () => {
		before(async () => {
			process.env.PRERENDER = true;

			fixture = await loadFixture({
				// inconsequential config that differs between tests
				// to bust cache and prevent modules and their state
				// from being reused
				site: 'https://test.dev/',
				base: '/some-base',
				root: './fixtures/prerender-404-500/',
				output: 'server',
				outDir: './dist/server-with-base',
				adapter: nodejs({ mode: 'standalone' }),
			});
			await fixture.build();
			const { startServer } = await fixture.loadAdapterEntryModule();
			const res = startServer();
			server = res.server;
			await waitServerListen(server.server);
		});

		after(async () => {
			await server.stop();
			await fixture.clean();
			process.env.PRERENDER = undefined;
		});

		it('Can render SSR route', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/some-base/static`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'Hello world!');
		});

		it('Can handle prerendered 404', async () => {
			const url = `http://${server.host}:${server.port}/some-base/missing`;
			const res1 = await fetch(url);
			const res2 = await fetch(url);
			const res3 = await fetch(url);

			assert.equal(res1.status, 404);
			assert.equal(res2.status, 404);
			assert.equal(res3.status, 404);

			const html1 = await res1.text();
			const html2 = await res2.text();
			const html3 = await res3.text();

			assert.equal(html1, html2);
			assert.equal(html2, html3);

			const $ = cheerio.load(html1);

			assert.equal($('body').text(), 'Page does not exist');
		});

		it(' Can handle prerendered 500 called indirectly', async () => {
			const url = `http://${server.host}:${server.port}/some-base/fivehundred`;
			const response1 = await fetch(url);
			const response2 = await fetch(url);
			const response3 = await fetch(url);

			assert.equal(response1.status, 500);

			const html1 = await response1.text();
			const html2 = await response2.text();
			const html3 = await response3.text();

			assert.equal(html1.includes('Something went wrong'), true);

			assert.equal(html1, html2);
			assert.equal(html2, html3);
		});

		it('prerendered 500 page includes expected styles', async () => {
			const response = await fetch(`http://${server.host}:${server.port}/some-base/fivehundred`);
			const html = await response.text();
			const $ = cheerio.load(html);

			// length will be 0 if the stylesheet does not get included
			assert.equal($('style').length, 1);
		});
	});

	describe('Without base', async () => {
		before(async () => {
			process.env.PRERENDER = true;

			fixture = await loadFixture({
				// inconsequential config that differs between tests
				// to bust cache and prevent modules and their state
				// from being reused
				site: 'https://test.info/',
				root: './fixtures/prerender-404-500/',
				output: 'server',
				outDir: './dist/server-without-base',
				adapter: nodejs({ mode: 'standalone' }),
			});
			await fixture.build();
			const { startServer } = await fixture.loadAdapterEntryModule();
			const res = startServer();
			server = res.server;
			await waitServerListen(server.server);
		});

		after(async () => {
			await server.stop();
			await fixture.clean();
			process.env.PRERENDER = undefined;
		});

		it('Can render SSR route', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/static`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'Hello world!');
		});

		it('Can handle prerendered 404', async () => {
			const url = `http://${server.host}:${server.port}/some-base/missing`;
			const res1 = await fetch(url);
			const res2 = await fetch(url);
			const res3 = await fetch(url);

			assert.equal(res1.status, 404);
			assert.equal(res2.status, 404);
			assert.equal(res3.status, 404);

			const html1 = await res1.text();
			const html2 = await res2.text();
			const html3 = await res3.text();

			assert.equal(html1, html2);
			assert.equal(html2, html3);

			const $ = cheerio.load(html1);

			assert.equal($('body').text(), 'Page does not exist');
		});
	});
});

describe('Hybrid 404', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let server;

	describe('With base', async () => {
		before(async () => {
			process.env.PRERENDER = false;
			fixture = await loadFixture({
				// inconsequential config that differs between tests
				// to bust cache and prevent modules and their state
				// from being reused
				site: 'https://test.com/',
				base: '/some-base',
				root: './fixtures/prerender-404-500/',
				output: 'static',
				outDir: './dist/hybrid-with-base',
				adapter: nodejs({ mode: 'standalone' }),
			});
			await fixture.build();
			const { startServer } = await fixture.loadAdapterEntryModule();
			const res = startServer();
			server = res.server;
			await waitServerListen(server.server);
		});

		after(async () => {
			await server.stop();
			await fixture.clean();
			process.env.PRERENDER = undefined;
		});

		it('Can render SSR route', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/some-base/static`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'Hello world!');
		});

		it('Can handle prerendered 404', async () => {
			const url = `http://${server.host}:${server.port}/some-base/missing`;
			const res1 = await fetch(url);
			const res2 = await fetch(url);
			const res3 = await fetch(url);

			assert.equal(res1.status, 404);
			assert.equal(res2.status, 404);
			assert.equal(res3.status, 404);

			const html1 = await res1.text();
			const html2 = await res2.text();
			const html3 = await res3.text();

			assert.equal(html1, html2);
			assert.equal(html2, html3);

			const $ = cheerio.load(html1);

			assert.equal($('body').text(), 'Page does not exist');
		});
	});

	describe('Without base', async () => {
		before(async () => {
			process.env.PRERENDER = false;
			fixture = await loadFixture({
				// inconsequential config that differs between tests
				// to bust cache and prevent modules and their state
				// from being reused
				site: 'https://test.net/',
				root: './fixtures/prerender-404-500/',
				output: 'static',
				outDir: './dist/hybrid-without-base',
				adapter: nodejs({ mode: 'standalone' }),
			});
			await fixture.build();
			const { startServer } = await fixture.loadAdapterEntryModule();
			const res = startServer();
			server = res.server;
			await waitServerListen(server.server);
		});

		after(async () => {
			await server.stop();
			await fixture.clean();
			process.env.PRERENDER = undefined;
		});

		it('Can render SSR route', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/static`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'Hello world!');
		});

		it('Can handle prerendered 404', async () => {
			const url = `http://${server.host}:${server.port}/missing`;
			const res1 = await fetch(url);
			const res2 = await fetch(url);
			const res3 = await fetch(url);

			assert.equal(res1.status, 404);
			assert.equal(res2.status, 404);
			assert.equal(res3.status, 404);

			const html1 = await res1.text();
			const html2 = await res2.text();
			const html3 = await res3.text();

			assert.equal(html1, html2);
			assert.equal(html2, html3);

			const $ = cheerio.load(html1);

			assert.equal($('body').text(), 'Page does not exist');
		});
	});
});

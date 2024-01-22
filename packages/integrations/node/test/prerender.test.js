import * as assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import nodejs from '../dist/index.js';
import { loadFixture } from './test-utils.js';
import * as cheerio from 'cheerio';

/**
 * @typedef {import('../../../astro/test/test-utils').Fixture} Fixture
 */

async function load() {
	const mod = await import(`./fixtures/prerender/dist/server/entry.mjs?dropcache=${Date.now()}`);
	return mod;
}
describe('Prerendering', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let server;

	describe('With base', async () => {
		before(async () => {
			process.env.PRERENDER = true;

			fixture = await loadFixture({
				base: '/some-base',
				root: './fixtures/prerender/',
				output: 'server',
				adapter: nodejs({ mode: 'standalone' }),
			});
			await fixture.build();
			const { startServer } = await load();
			let res = startServer();
			server = res.server;
		});

		after(async () => {
			await server.stop();
			await fixture.clean();
			delete process.env.PRERENDER;
		});

		it('Can render SSR route', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/some-base/one`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'One');
		});

		it('Can render prerendered route', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/some-base/two`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'Two');
		});

		it('Can render prerendered route with redirect and query params', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/some-base/two?foo=bar`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'Two');
		});

		it('Can render prerendered route with query params', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/some-base/two/?foo=bar`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'Two');
		});

		it('Omitting the trailing slash results in a redirect that includes the base', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/some-base/two`, {
				redirect: 'manual',
			});
			assert.equal(res.status, 301);
			assert.equal(res.headers.get('location'), '/some-base/two/');
		});
	});

	describe('Without base', async () => {
		before(async () => {
			process.env.PRERENDER = true;

			fixture = await loadFixture({
				root: './fixtures/prerender/',
				output: 'server',
				adapter: nodejs({ mode: 'standalone' }),
			});
			await fixture.build();
			const { startServer } = await await load();
			let res = startServer();
			server = res.server;
		});

		after(async () => {
			await server.stop();
			await fixture.clean();
			delete process.env.PRERENDER;
		});

		it('Can render SSR route', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/one`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'One');
		});

		it('Can render prerendered route', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/two`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'Two');
		});

		it('Can render prerendered route with redirect and query params', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/two?foo=bar`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'Two');
		});

		it('Can render prerendered route with query params', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/two/?foo=bar`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'Two');
		});
	});
});

describe('Hybrid rendering', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let server;

	describe('With base', async () => {
		before(async () => {
			process.env.PRERENDER = false;
			fixture = await loadFixture({
				base: '/some-base',
				root: './fixtures/prerender/',
				output: 'hybrid',
				adapter: nodejs({ mode: 'standalone' }),
			});
			await fixture.build();
			const { startServer } = await await load();
			let res = startServer();
			server = res.server;
		});

		after(async () => {
			await server.stop();
			await fixture.clean();
			delete process.env.PRERENDER;
		});

		it('Can render SSR route', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/some-base/two`);
			const html = await res.text();
			const $ = cheerio.load(html);
			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'Two');
		});

		it('Can render prerendered route', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/some-base/one`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'One');
		});

		it('Can render prerendered route with redirect and query params', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/some-base/one?foo=bar`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'One');
		});

		it('Can render prerendered route with query params', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/some-base/one/?foo=bar`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'One');
		});

		it('Omitting the trailing slash results in a redirect that includes the base', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/some-base/one`, {
				redirect: 'manual',
			});
			assert.equal(res.status, 301);
			assert.equal(res.headers.get('location'), '/some-base/one/');
		});
	});

	describe('Without base', async () => {
		before(async () => {
			process.env.PRERENDER = false;
			fixture = await loadFixture({
				root: './fixtures/prerender/',
				output: 'hybrid',
				adapter: nodejs({ mode: 'standalone' }),
			});
			await fixture.build();
			const { startServer } = await await load();
			let res = startServer();
			server = res.server;
		});

		after(async () => {
			await server.stop();
			await fixture.clean();
			delete process.env.PRERENDER;
		});

		it('Can render SSR route', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/two`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'Two');
		});

		it('Can render prerendered route', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/one`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'One');
		});

		it('Can render prerendered route with redirect and query params', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/one?foo=bar`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'One');
		});

		it('Can render prerendered route with query params', async () => {
			const res = await fetch(`http://${server.host}:${server.port}/one/?foo=bar`);
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal(res.status, 200);
			assert.equal($('h1').text(), 'One');
		});
	});
});

import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import nodejs from '../dist/index.js';
import { loadFixture, waitServerListen } from './test-utils.js';

/**
 * @typedef {import('../../../astro/test/test-utils').Fixture} Fixture
 */

describe('Trailing slash', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let server;
	describe('Always', async () => {
		describe('With base', async () => {
			before(async () => {
				process.env.ASTRO_NODE_AUTOSTART = 'disabled';
				process.env.PRERENDER = true;

				fixture = await loadFixture({
					root: './fixtures/trailing-slash/',
					base: '/some-base',
					output: 'static',
					trailingSlash: 'always',
					outDir: './dist/always-with-base',
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

				delete process.env.PRERENDER;
			});

			it('Can render prerendered base route', async () => {
				const res = await fetch(`http://${server.host}:${server.port}`);
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'Index');
			});

			it('Can render prerendered route with redirect', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/some-base/one`, {
					redirect: 'manual',
				});
				assert.equal(res.status, 301);
				assert.equal(res.headers.get('location'), '/some-base/one/');
			});

			it('Can render prerendered route with redirect and query params', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/some-base/one?foo=bar`, {
					redirect: 'manual',
				});
				assert.equal(res.status, 301);
				assert.equal(res.headers.get('location'), '/some-base/one/?foo=bar');
			});

			it('Can render prerendered route with query params', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/some-base/one/?foo=bar`);
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'One');
			});

			it('Does not add trailing slash to subresource urls', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/some-base/one.css`);
				const css = await res.text();

				assert.equal(res.status, 200);
				assert.equal(css, 'h1 { color: red; }\n');
			});
		});
		describe('Without base', async () => {
			before(async () => {
				process.env.ASTRO_NODE_AUTOSTART = 'disabled';
				process.env.PRERENDER = true;

				fixture = await loadFixture({
					root: './fixtures/trailing-slash/',
					output: 'static',
					trailingSlash: 'always',
					outDir: './dist/always-without-base',
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

				delete process.env.PRERENDER;
			});

			it('Can render prerendered base route', async () => {
				const res = await fetch(`http://${server.host}:${server.port}`);
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'Index');
			});

			it('Can render prerendered route with redirect', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/one`, {
					redirect: 'manual',
				});
				assert.equal(res.status, 301);
				assert.equal(res.headers.get('location'), '/one/');
			});

			it('Can render prerendered route with redirect and query params', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/one?foo=bar`, {
					redirect: 'manual',
				});
				assert.equal(res.status, 301);
				assert.equal(res.headers.get('location'), '/one/?foo=bar');
			});

			it('Can render prerendered route with query params', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/one/?foo=bar`);
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'One');
			});

			it('Does not add trailing slash to subresource urls', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/one.css`);
				const css = await res.text();

				assert.equal(res.status, 200);
				assert.equal(css, 'h1 { color: red; }\n');
			});
		});
	});
	describe('Never', async () => {
		describe('With base', async () => {
			before(async () => {
				process.env.ASTRO_NODE_AUTOSTART = 'disabled';
				process.env.PRERENDER = true;

				fixture = await loadFixture({
					root: './fixtures/trailing-slash/',
					base: '/some-base',
					output: 'static',
					trailingSlash: 'never',
					outDir: './dist/never-with-base',
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

				delete process.env.PRERENDER;
			});

			it('Can render prerendered base route', async () => {
				const res = await fetch(`http://${server.host}:${server.port}`);
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'Index');
			});

			it('Can render prerendered route with redirect', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/some-base/one/`, {
					redirect: 'manual',
				});
				assert.equal(res.status, 301);
				assert.equal(res.headers.get('location'), '/some-base/one');
			});

			it('Can render prerendered route with redirect and query params', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/some-base/one/?foo=bar`, {
					redirect: 'manual',
				});

				assert.equal(res.status, 301);
				assert.equal(res.headers.get('location'), '/some-base/one?foo=bar');
			});

			it('Can render prerendered route with query params', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/some-base/one?foo=bar`);
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'One');
			});
		});
		describe('Without base', async () => {
			before(async () => {
				process.env.ASTRO_NODE_AUTOSTART = 'disabled';
				process.env.PRERENDER = true;

				fixture = await loadFixture({
					root: './fixtures/trailing-slash/',
					output: 'static',
					trailingSlash: 'never',
					outDir: './dist/never-without-base',
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

				delete process.env.PRERENDER;
			});

			it('Can render prerendered base route', async () => {
				const res = await fetch(`http://${server.host}:${server.port}`);
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'Index');
			});

			it('Can render prerendered route with redirect', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/one/`, {
					redirect: 'manual',
				});
				assert.equal(res.status, 301);
				assert.equal(res.headers.get('location'), '/one');
			});

			it('Can render prerendered route with redirect and query params', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/one/?foo=bar`, {
					redirect: 'manual',
				});

				assert.equal(res.status, 301);
				assert.equal(res.headers.get('location'), '/one?foo=bar');
			});

			it('Can render prerendered route and query params', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/one?foo=bar`);
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'One');
			});
		});
	});
	describe('Ignore', async () => {
		describe('With base', async () => {
			before(async () => {
				process.env.ASTRO_NODE_AUTOSTART = 'disabled';
				process.env.PRERENDER = true;

				fixture = await loadFixture({
					root: './fixtures/trailing-slash/',
					base: '/some-base',
					output: 'static',
					trailingSlash: 'ignore',
					outDir: './dist/ignore-with-base',
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

				delete process.env.PRERENDER;
			});

			it('Can render prerendered base route', async () => {
				const res = await fetch(`http://${server.host}:${server.port}`);
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'Index');
			});

			it('Can render prerendered route with slash', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/some-base/one/`, {
					redirect: 'manual',
				});
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'One');
			});

			it('Can render prerendered route without slash', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/some-base/one`, {
					redirect: 'manual',
				});
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'One');
			});

			it('Can render prerendered route with slash and query params', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/some-base/one/?foo=bar`, {
					redirect: 'manual',
				});
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'One');
			});

			it('Can render prerendered route without slash and with query params', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/some-base/one?foo=bar`, {
					redirect: 'manual',
				});
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'One');
			});
		});
		describe('Without base', async () => {
			before(async () => {
				process.env.ASTRO_NODE_AUTOSTART = 'disabled';
				process.env.PRERENDER = true;

				fixture = await loadFixture({
					root: './fixtures/trailing-slash/',
					output: 'static',
					trailingSlash: 'ignore',
					outDir: './dist/ignore-without-base',
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

				delete process.env.PRERENDER;
			});

			it('Can render prerendered base route', async () => {
				const res = await fetch(`http://${server.host}:${server.port}`);
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'Index');
			});

			it('Can render prerendered route with slash', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/one/`);
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'One');
			});

			it('Can render prerendered route without slash', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/one`);
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'One');
			});

			it('Can render prerendered route with slash and query params', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/one/?foo=bar`, {
					redirect: 'manual',
				});
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'One');
			});

			it('Can render prerendered route without slash and with query params', async () => {
				const res = await fetch(`http://${server.host}:${server.port}/one?foo=bar`);
				const html = await res.text();
				const $ = cheerio.load(html);

				assert.equal(res.status, 200);
				assert.equal($('h1').text(), 'One');
			});
		});
	});
});

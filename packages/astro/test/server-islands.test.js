import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Server islands', () => {
	describe('SSR', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/server-islands/ssr',
				adapter: testAdapter(),
			});
		});

		describe('dev', () => {
			let devServer;

			before(async () => {
				process.env.ASTRO_KEY = 'eKBaVEuI7YjfanEXHuJe/pwZKKt3LkAHeMxvTU7aR0M=';
				devServer = await fixture.startDevServer();
			});

			after(async () => {
				await devServer.stop();
				delete process.env.ASTRO_KEY;
			});

			it('omits the islands HTML', async () => {
				const res = await fixture.fetch('/');
				assert.equal(res.status, 200);
				const html = await res.text();
				const $ = cheerio.load(html);
				const serverIslandEl = $('h2#island');
				assert.equal(serverIslandEl.length, 0);
			});

			it('HTML escapes scripts', async () => {
				const res = await fixture.fetch('/');
				assert.equal(res.status, 200);
				const html = await res.text();
				assert.equal(html.includes("</script><script>alert('xss')</script><!--"), false);
			});

			it('island is not indexed', async () => {
				const res = await fixture.fetch('/_server-islands/Island', {
					method: 'POST',
					body: JSON.stringify({
						componentExport: 'default',
						encryptedProps: 'FC8337AF072BE5B1641501E1r8mLIhmIME1AV7UO9XmW9OLD',
						slots: {},
					}),
				});
				assert.equal(res.headers.get('x-robots-tag'), 'noindex');
			});

			it('island can set headers', async () => {
				const res = await fixture.fetch('/_server-islands/Island', {
					method: 'POST',
					body: JSON.stringify({
						componentExport: 'default',
						encryptedProps: 'FC8337AF072BE5B1641501E1r8mLIhmIME1AV7UO9XmW9OLD',
						slots: {},
					}),
				});
				const works = res.headers.get('X-Works');
				assert.equal(works, 'true', 'able to set header from server island');
			});
			it('omits empty props from the query string', async () => {
				const res = await fixture.fetch('/empty-props');
				assert.equal(res.status, 200);
				const html = await res.text();
				const fetchMatch = html.match(/fetch\('\/_server-islands\/Island\?[^']*p=([^&']*)/);
				assert.equal(fetchMatch.length, 2, 'should include props in the query	string');
				assert.equal(fetchMatch[1], '', 'should not include encrypted empty props');
			});
			it('re-encrypts props on each request', async () => {
				const res = await fixture.fetch('/includeComponentWithProps/');
				assert.equal(res.status, 200);
				const html = await res.text();
				const fetchMatch = html.match(
					/fetch\('\/_server-islands\/ComponentWithProps\?[^']*p=([^&']*)/,
				);
				assert.equal(fetchMatch.length, 2, 'should include props in the query	string');
				const firstProps = fetchMatch[1];
				const secondRes = await fixture.fetch('/includeComponentWithProps/');
				assert.equal(secondRes.status, 200);
				const secondHtml = await secondRes.text();
				const secondFetchMatch = secondHtml.match(
					/fetch\('\/_server-islands\/ComponentWithProps\?[^']*p=([^&']*)/,
				);
				assert.equal(secondFetchMatch.length, 2, 'should include props in the query	string');
				assert.notEqual(
					secondFetchMatch[1],
					firstProps,
					'should re-encrypt props on each request with a different IV',
				);
			});
		});

		describe('prod', () => {
			before(async () => {
				process.env.ASTRO_KEY = 'eKBaVEuI7YjfanEXHuJe/pwZKKt3LkAHeMxvTU7aR0M=';
				await fixture.build();
			});

			after(async () => {
				delete process.env.ASTRO_KEY;
			});

			it('omits the islands HTML', async () => {
				const app = await fixture.loadTestAdapterApp();
				const request = new Request('http://example.com/');
				const response = await app.render(request);
				const html = await response.text();

				const $ = cheerio.load(html);
				const serverIslandEl = $('h2#island');
				assert.equal(serverIslandEl.length, 0);

				const serverIslandScript = $('script[data-island-id]');
				assert.equal(serverIslandScript.length, 1, 'has the island script');
			});

			it('island is not indexed', async () => {
				const app = await fixture.loadTestAdapterApp();
				const request = new Request('http://example.com/_server-islands/Island', {
					method: 'POST',
					body: JSON.stringify({
						componentExport: 'default',
						encryptedProps: 'FC8337AF072BE5B1641501E1r8mLIhmIME1AV7UO9XmW9OLD',
						slots: {},
					}),
					headers: {
						origin: 'http://example.com',
					},
				});
				const response = await app.render(request);
				assert.equal(response.headers.get('x-robots-tag'), 'noindex');
			});
			it('omits empty props from the query string', async () => {
				const app = await fixture.loadTestAdapterApp();
				const request = new Request('http://example.com/empty-props');
				const response = await app.render(request);
				assert.equal(response.status, 200);
				const html = await response.text();
				const fetchMatch = html.match(/fetch\('\/_server-islands\/Island\?[^']*p=([^&']*)/);
				assert.equal(fetchMatch.length, 2, 'should include props in the query	string');
				assert.equal(fetchMatch[1], '', 'should not include encrypted empty props');
			});
			it('re-encrypts props on each request', async () => {
				const app = await fixture.loadTestAdapterApp();
				const request = new Request('http://example.com/includeComponentWithProps/');
				const response = await app.render(request);
				assert.equal(response.status, 200);
				const html = await response.text();
				const fetchMatch = html.match(
					/fetch\('\/_server-islands\/ComponentWithProps\?[^']*p=([^&']*)/,
				);
				assert.equal(fetchMatch.length, 2, 'should include props in the query	string');
				const firstProps = fetchMatch[1];
				const secondRequest = new Request('http://example.com/includeComponentWithProps/');
				const secondResponse = await app.render(secondRequest);
				assert.equal(secondResponse.status, 200);
				const secondHtml = await secondResponse.text();
				const secondFetchMatch = secondHtml.match(
					/fetch\('\/_server-islands\/ComponentWithProps\?[^']*p=([^&']*)/,
				);
				assert.equal(secondFetchMatch.length, 2, 'should include props in the query	string');
				assert.notEqual(
					secondFetchMatch[1],
					firstProps,
					'should re-encrypt props on each request with a different IV',
				);
			});
		});
	});

	describe('Hybrid mode', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/server-islands/hybrid',
			});
		});

		describe('build', () => {
			before(async () => {
				await fixture.build({
					adapter: testAdapter(),
				});
			});

			it('Omits the island HTML from the static HTML', async () => {
				let html = await fixture.readFile('/client/index.html');

				const $ = cheerio.load(html);
				const serverIslandEl = $('h2#island');
				assert.equal(serverIslandEl.length, 0);

				const serverIslandScript = $('script[data-island-id]');
				assert.equal(serverIslandScript.length, 1, 'has the island script');
			});
		});

		describe('build (no adapter)', () => {
			it('Errors during the build', async () => {
				try {
					await fixture.build({
						adapter: undefined,
					});
					assert.equal(true, false, 'should not have succeeded');
				} catch (err) {
					assert.equal(err.title, 'Cannot use Server Islands without an adapter.');
				}
			});
		});
	});
});

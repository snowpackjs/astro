import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { load as cheerioLoad } from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Dynamic pages in SSR', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		const root = './fixtures/ssr-dynamic/';
		fixture = await loadFixture({
			root,
			output: 'server',
			integrations: [
				{
					name: 'inject-routes',
					hooks: {
						'astro:config:setup': ({ injectRoute }) => {
							injectRoute({
								pattern: '/path-alias/[id]',
								entrypoint: './src/pages/api/products/[id].js',
							});

							const entrypoint = fileURLToPath(
								new URL(`${root}.astro/test.astro`, import.meta.url),
							);
							mkdirSync(dirname(entrypoint), { recursive: true });
							writeFileSync(entrypoint, '<h1>Index</h1>');

							injectRoute({
								pattern: '/test',
								entrypoint,
							});
						},
					},
				},
			],
			adapter: testAdapter(),
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
		await fixture.build();
	});

	async function matchRoute(path) {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('https://example.com' + path);
		return app.match(request);
	}

	async function fetchHTML(path) {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com' + path);
		const response = await app.render(request);
		const html = await response.text();
		return html;
	}

	async function fetchJSON(path) {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com' + path);
		const response = await app.render(request);
		const json = await response.json();
		return json;
	}

	it('Do not have to implement getStaticPaths', async () => {
		const html = await fetchHTML('/123');
		const $ = cheerioLoad(html);
		assert.equal($('h1').text(), 'Item 123');
	});

	it('Includes page styles', async () => {
		const html = await fetchHTML('/123');
		const $ = cheerioLoad(html);
		assert.equal($('link').length, 1);
	});

	it('Dynamic API routes work', async () => {
		const json = await fetchJSON('/api/products/33');
		assert.equal(json.id, '33');
	});

	it('Injected route work', async () => {
		const json = await fetchJSON('/path-alias/33');
		assert.equal(json.id, '33');
	});

	it('Public assets take priority', async () => {
		const favicon = await matchRoute('/favicon.ico');
		assert.equal(favicon, undefined);
	});

	it('injectRoute entrypoint should not fail build if containing the extension several times in the path', async () => {
		const html = await fetchHTML('/test');
		const $ = cheerioLoad(html);
		assert.equal($('h1').text(), 'Index');
	});
});

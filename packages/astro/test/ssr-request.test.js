import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Using Astro.request in SSR', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/ssr-request/',
			adapter: testAdapter(),
			output: 'server',
			base: '/subpath/',
			integrations: [
				{
					name: 'inject-script',
					hooks: {
						'astro:config:setup'({ injectScript }) {
							injectScript('page', 'import "/src/scripts/inject-script.js";');
						},
					},
				},
			],
			vite: {
				build: {
					assetsInlineLimit: 0,
				},
			},
		});
		await fixture.build();
	});

	it('Gets the request passed in', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/subpath/request');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerioLoad(html);
		assert.equal($('#origin').text(), 'http://example.com');
	});

	it('public file is copied over', async () => {
		const json = await fixture.readFile('/client/cars.json');
		assert.notEqual(json, undefined);
	});

	it('CSS assets have their base prefix', async () => {
		const app = await fixture.loadTestAdapterApp();
		let request = new Request('http://example.com/subpath/request');
		let response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerioLoad(html);

		const linkHref = $('link').attr('href');
		assert.equal(linkHref.startsWith('/subpath/'), true);

		request = new Request('http://example.com' + linkHref);
		response = await app.render(request);

		assert.equal(response.status, 200);
		const css = await response.text();
		assert.notEqual(css, undefined);
	});

	it('script assets have their base prefix', async () => {
		const app = await fixture.loadTestAdapterApp();
		let request = new Request('http://example.com/subpath/request');
		let response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerioLoad(html);

		for (const el of $('script')) {
			const scriptSrc = $(el).attr('src');
			assert.equal(scriptSrc.startsWith('/subpath/'), true);
			request = new Request('http://example.com' + scriptSrc);
			response = await app.render(request);

			assert.equal(response.status, 200);
			const js = await response.text();
			assert.notEqual(js, undefined);
		}
	});

	it('assets can be fetched', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/subpath/cars.json');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const data = await response.json();
		assert.equal(data instanceof Array, true);
	});

	it('middleware gets the actual path sent in the request', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/this//is/my/////directory');
		const response = await app.render(request);
		assert.equal(response.status, 301);
	});
});

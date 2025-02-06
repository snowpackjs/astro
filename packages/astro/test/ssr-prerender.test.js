import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('SSR: prerender', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/ssr-prerender/',
			output: 'server',
			outDir: './dist/normal',
			adapter: testAdapter(),
		});
		await fixture.build();
	});

	describe('Prerendering', () => {
		// Prerendered assets are not served directly by `app`,
		// they're served _in front of_ the app as static assets!
		it('Does not render static page', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/static');
			const response = await app.render(request);
			assert.equal(response.status, 404);
		});

		it('includes prerendered pages in the asset manifest', async () => {
			const app = await fixture.loadTestAdapterApp();
			/** @type {Set<string>} */
			const assets = app.manifest.assets;
			assert.equal(assets.has('/static/index.html'), true);
		});
	});

	describe('Astro.params in SSR', () => {
		it('Params are passed to component', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/users/houston');
			const response = await app.render(request);
			assert.equal(response.status, 200);
			const html = await response.text();
			const $ = cheerio.load(html);
			assert.equal($('.user').text(), 'houston');
		});
	});

	describe('New prerender option breaks catch-all route on root when using preview', () => {
		// bug id #6020
		it('fix bug id #6020', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/some');
			const response = await app.render(request);
			assert.equal(response.status, 200);
			const html = await response.text();
			const $ = cheerio.load(html);
			assert.equal($('p').text().includes('not give 404'), true);
		});
	});
});

// NOTE: This test doesn't make sense as it relies on the fact that on the client build,
// you can change the prerender state of pages from the SSR build, however, the client build
// is not always guaranteed to run. If we want to support this feature, we may want to only allow
// editing `route.prerender` on the `astro:build:done` hook.
describe.skip('Integrations can hook into the prerendering decision', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	const testIntegration = {
		name: 'test prerendering integration',
		hooks: {
			['astro:build:setup']({ pages, target }) {
				if (target !== 'client') return;
				// this page has `export const prerender = true`
				pages.get('src/pages/static.astro').route.prerender = false;

				// this page does not
				pages.get('src/pages/not-prerendered.astro').route.prerender = true;
			},
		},
	};

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/ssr-prerender/',
			output: 'server',
			outDir: './dist/integration-prerender',
			integrations: [testIntegration],
			adapter: testAdapter(),
		});
		await fixture.build();
	});

	it('An integration can override the prerender flag', async () => {
		// test adapter only hosts dynamic routes
		// /static is expected to become dynamic
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/static');
		const response = await app.render(request);
		assert.equal(response.status, 200);
	});

	it('An integration can turn a normal page to a prerendered one', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/not-prerendered');
		const response = await app.render(request);
		assert.equal(response.status, 404);
	});
});

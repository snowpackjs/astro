import assert from 'node:assert/strict';
import { renameSync } from 'node:fs';
import { afterEach, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Custom 500', () => {
	/** @type {Awaited<ReturnType<typeof loadFixture>>} */
	let fixture;

	describe('dev', () => {
		/** @type {Awaited<ReturnType<(typeof fixture)["startDevServer"]>>} */
		let devServer;

		afterEach(async () => {
			await devServer?.stop();
			try {
				renameSync(
					new URL('./fixtures/custom-500/src/pages/_500.astro', import.meta.url),
					new URL('./fixtures/custom-500/src/pages/500.astro', import.meta.url),
				);
			} catch (_) {}
		});

		it('renders default error overlay', async () => {
			renameSync(
				new URL('./fixtures/custom-500/src/pages/500.astro', import.meta.url),
				new URL('./fixtures/custom-500/src/pages/_500.astro', import.meta.url),
			);
			fixture = await loadFixture({
				root: './fixtures/custom-500/',
				output: 'server',
				adapter: testAdapter(),
			});
			devServer = await fixture.startDevServer();

			const response = await fixture.fetch('/');
			assert.equal(response.status, 500);

			const html = await response.text();

			assert.equal(html, '<title>Error</title><script type="module" src="/@vite/client"></script>');
		});

		it('renders custom 500', async () => {
			fixture = await loadFixture({
				root: './fixtures/custom-500/',
				output: 'server',
				adapter: testAdapter(),
			});
			devServer = await fixture.startDevServer();

			const response = await fixture.fetch('/');
			assert.equal(response.status, 500);

			const html = await response.text();
			const $ = cheerio.load(html);

			assert.equal($('h1').text(), 'Server error');
			assert.equal($('p').text(), 'some error');
		});

		it('renders default error overlay if custom 500 throws', async () => {
			fixture = await loadFixture({
				root: './fixtures/custom-500-failing/',
				output: 'server',
				adapter: testAdapter(),
			});
			devServer = await fixture.startDevServer();

			const response = await fixture.fetch('/');
			assert.equal(response.status, 500);

			const html = await response.text();

			assert.equal(html, '<title>Error</title><script type="module" src="/@vite/client"></script>');
		});
	});

	describe('SSR', () => {
		/** @type {Awaited<ReturnType<(typeof fixture)["loadTestAdapterApp"]>>} */
		let app;

		it('renders custom 500', async () => {
			fixture = await loadFixture({
				root: './fixtures/custom-500/',
				output: 'server',
				adapter: testAdapter(),
			});
			await fixture.build();
			app = await fixture.loadTestAdapterApp();

			const request = new Request('http://example.com/');
			const response = await app.render(request);
			assert.equal(response.status, 500);

			const html = await response.text();
			const $ = cheerio.load(html);

			assert.equal($('h1').text(), 'Server error');
			assert.equal($('p').text(), 'some error');
		});

		it('renders nothing if custom 500 throws', async () => {
			fixture = await loadFixture({
				root: './fixtures/custom-500-failing/',
				output: 'server',
				adapter: testAdapter(),
			});
			await fixture.build();
			app = await fixture.loadTestAdapterApp();

			const request = new Request('http://example.com/');
			const response = await app.render(request);
			assert.equal(response.status, 500);

			const html = await response.text();
			assert.equal(html, '');
		});
	});
});

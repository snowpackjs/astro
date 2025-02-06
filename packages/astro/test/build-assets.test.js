import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { preact } from './fixtures/before-hydration/deps.mjs';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('build assets (static)', () => {
	describe('with default configuration', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/build-assets/',
				integrations: [preact()],
				// test suite was authored when inlineStylesheets defaulted to never
				build: { inlineStylesheets: 'never' },
			});
			await fixture.build();
		});

		it('Populates /_astro directory', async () => {
			let files = await fixture.readdir('/_astro');
			assert.equal(files.length > 0, true);
		});

		it('Defaults to flat /_astro output', async () => {
			let files = await fixture.readdir('/_astro');
			for (const file of files) {
				assert.equal(file.slice(1).includes('/'), false);
			}
		});

		it('emits CSS assets to /_astro', async () => {
			let html = await fixture.readFile('/index.html');
			let $ = cheerio.load(html);

			assert.match($('link[href$=".css"]').attr('href'), /^\/_astro\//);
		});

		it('emits JS assets to /_astro', async () => {
			let html = await fixture.readFile('/index.html');
			let $ = cheerio.load(html);

			const island = $('astro-island');
			assert.equal(island.length, 1);
			assert.match(island.attr('component-url'), /^\/_astro\//);
			assert.match(island.attr('renderer-url'), /^\/_astro\//);
		});
	});

	describe('with custom configuration', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/build-assets/',
				integrations: [preact()],
				build: {
					assets: 'custom-assets',
					inlineStylesheets: 'never',
				},
			});
			await fixture.build();
		});

		it('Populates /custom-assets directory', async () => {
			let files = await fixture.readdir('/custom-assets');
			assert.equal(files.length > 0, true);
		});

		it('emits CSS assets to /custom-assets', async () => {
			let html = await fixture.readFile('/index.html');
			let $ = cheerio.load(html);

			assert.match($('link[href$=".css"]').attr('href'), /^\/custom-assets\//);
		});

		it('emits JS assets to /custom-assets', async () => {
			let html = await fixture.readFile('/index.html');
			let $ = cheerio.load(html);

			const island = $('astro-island');
			assert.equal(island.length, 1);
			assert.match(island.attr('component-url'), /^\/custom-assets\//);
			assert.match(island.attr('renderer-url'), /^\/custom-assets\//);
		});
	});
});

describe('build assets (server)', () => {
	describe('with default configuration', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/build-assets/',
				integrations: [preact()],
				adapter: testAdapter({ extendAdapter: { adapterFeatures: { buildOutput: 'static' } } }),
				// test suite was authored when inlineStylesheets defaulted to never
				build: { inlineStylesheets: 'never' },
			});
			await fixture.build();
		});

		it('Populates /_astro directory', async () => {
			let files = await fixture.readdir('/_astro');
			assert.equal(files.length > 0, true);
		});

		it('Defaults to flat /_astro output', async () => {
			let files = await fixture.readdir('/_astro');
			for (const file of files) {
				assert.equal(file.slice(1).includes('/'), false);
			}
		});

		it('emits CSS assets to /_astro', async () => {
			let html = await fixture.readFile('/index.html');
			let $ = cheerio.load(html);

			assert.match($('link[href$=".css"]').attr('href'), /^\/_astro\//);
		});

		it('emits JS assets to /_astro', async () => {
			let html = await fixture.readFile('/index.html');
			let $ = cheerio.load(html);

			const island = $('astro-island');
			assert.equal(island.length, 1);
			assert.match(island.attr('component-url'), /^\/_astro\//);
			assert.match(island.attr('renderer-url'), /^\/_astro\//);
		});
	});

	describe('with custom configuration', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/build-assets/',
				integrations: [preact()],
				build: {
					assets: 'custom-assets',
					inlineStylesheets: 'never',
				},
				adapter: testAdapter({
					extendAdapter: {
						adapterFeatures: {
							buildOutput: 'static',
						},
					},
				}),
			});
			await fixture.build();
		});

		it('Populates /custom-assets directory', async () => {
			let files = await fixture.readdir('/custom-assets');
			assert.equal(files.length > 0, true);
		});

		it('emits CSS assets to /custom-assets', async () => {
			let html = await fixture.readFile('/index.html');
			let $ = cheerio.load(html);

			assert.match($('link[href$=".css"]').attr('href'), /^\/custom-assets\//);
		});

		it('emits JS assets to /custom-assets', async () => {
			let html = await fixture.readFile('/index.html');
			let $ = cheerio.load(html);

			const island = $('astro-island');
			assert.equal(island.length, 1);
			assert.match(island.attr('component-url'), /^\/custom-assets\//);
			assert.match(island.attr('renderer-url'), /^\/custom-assets\//);
		});
	});
});

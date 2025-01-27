import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Content Collections - render()', () => {
	describe('Build - SSG', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/content/',
				// test suite was authored when inlineStylesheets defaulted to never
				build: { inlineStylesheets: 'never' },
			});
			await fixture.build();
		});

		it('Includes CSS for rendered entry', async () => {
			const html = await fixture.readFile('/launch-week/index.html');
			const $ = cheerio.load(html);

			// Renders content
			assert.equal($('ul li').length, 3);

			// Includes styles
			assert.equal($('link[rel=stylesheet]').length, 1);
		});

		it('Excludes CSS for non-rendered entries', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			// Excludes styles
			assert.equal($('link[rel=stylesheet]').length, 0);
		});

		it('De-duplicates CSS used both in layout and directly in target page', async () => {
			const html = await fixture.readFile('/with-layout-prop/index.html');
			const $ = cheerio.load(html);

			const set = new Set();

			$('link[rel=stylesheet]').each((_, linkEl) => {
				const href = linkEl.attribs.href;
				assert.equal(set.has(href), false);
				set.add(href);
			});

			$('style').each((_, styleEl) => {
				const textContent = styleEl.children[0].data;
				assert.equal(set.has(textContent), false);
				set.add(textContent);
			});
		});

		it('Includes component scripts for rendered entry', async () => {
			const html = await fixture.readFile('/launch-week-component-scripts/index.html');
			const $ = cheerio.load(html);

			// Includes script
			assert.equal($('script[type="module"]').length, 1);

			// Includes inline script
			assert.equal($('script[data-is-inline]').length, 1);
		});

		it('Excludes component scripts for non-rendered entries', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.equal($('script').length, 0);
		});

		it('Applies MDX components export', async () => {
			const html = await fixture.readFile('/launch-week-components-export/index.html');
			const $ = cheerio.load(html);

			const h2 = $('h2');
			assert.equal(h2.length, 1);
			assert.equal(h2.attr('data-components-export-applied'), 'true');
		});
	});

	describe('Build - SSR', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				output: 'server',
				root: './fixtures/content/',
				adapter: testAdapter(),
				// test suite was authored when inlineStylesheets defaulted to never
				build: { inlineStylesheets: 'never' },
			});
			await fixture.build();
		});

		it('Includes CSS for rendered entry', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/launch-week');
			const response = await app.render(request);
			const html = await response.text();
			const $ = cheerio.load(html);

			// Renders content
			assert.equal($('ul li').length, 3);

			// Includes styles
			assert.equal($('link[rel=stylesheet]').length, 1);
		});

		it('Exclude CSS for non-rendered entries', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/');
			const response = await app.render(request);
			const html = await response.text();
			const $ = cheerio.load(html);

			// Includes styles
			assert.equal($('link[rel=stylesheet]').length, 0);
		});

		it('De-duplicates CSS used both in layout and directly in target page', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/with-layout-prop/');
			const response = await app.render(request);
			const html = await response.text();
			const $ = cheerio.load(html);

			const set = new Set();

			$('link[rel=stylesheet]').each((_, linkEl) => {
				const href = linkEl.attribs.href;
				assert.equal(set.has(href), false);
				set.add(href);
			});

			$('style').each((_, styleEl) => {
				const textContent = styleEl.children[0].data;
				assert.equal(set.has(textContent), false);
				set.add(textContent);
			});
		});

		it('Applies MDX components export', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/launch-week-components-export');
			const response = await app.render(request);
			const html = await response.text();
			const $ = cheerio.load(html);

			const h2 = $('h2');
			assert.equal(h2.length, 1);
			assert.equal(h2.attr('data-components-export-applied'), 'true');
		});

		it('getCollection should return new instances of the array to be mutated safely', async () => {
			const app = await fixture.loadTestAdapterApp();

			let request = new Request('http://example.com/sort-blog-collection');
			let response = await app.render(request);
			let html = await response.text();
			let $ = cheerio.load(html);
			assert.equal($('li').first().text(), 'With Layout Prop');

			request = new Request('http://example.com/');
			response = await app.render(request);
			html = await response.text();
			$ = cheerio.load(html);
			assert.equal($('li').first().text(), 'Hello world');
		});
	});

	describe('Dev - SSG', () => {
		let devServer;
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/content/',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('Includes CSS for rendered entry', async () => {
			const response = await fixture.fetch('/launch-week', { method: 'GET' });
			assert.equal(response.status, 200);

			const html = await response.text();
			const $ = cheerio.load(html);

			// Renders content
			assert.equal($('ul li').length, 3);

			// Includes styles
			assert.equal($('head > style').length, 1);
			assert.ok($('head > style').text().includes("font-family: 'Comic Sans MS'"));
		});

		it('Includes component scripts for rendered entry', async () => {
			const response = await fixture.fetch('/launch-week-component-scripts', { method: 'GET' });
			assert.equal(response.status, 200);

			const html = await response.text();
			const $ = cheerio.load(html);

			// Includes script
			assert.equal($('script[type="module"][src*="WithScripts.astro"]').length, 1);

			// Includes inline script
			assert.equal($('script[data-is-inline]').length, 1);
		});

		it('Applies MDX components export', async () => {
			const response = await fixture.fetch('/launch-week-components-export', { method: 'GET' });
			assert.equal(response.status, 200);

			const html = await response.text();
			const $ = cheerio.load(html);

			const h2 = $('h2');
			assert.equal(h2.length, 1);
			assert.equal(h2.attr('data-components-export-applied'), 'true');
		});

		it('Supports layout prop with recursive getCollection() call', async () => {
			const response = await fixture.fetch('/with-layout-prop', { method: 'GET' });
			assert.equal(response.status, 200);

			const html = await response.text();
			const $ = cheerio.load(html);

			const body = $('body');
			assert.equal(body.attr('data-layout-prop'), 'true');

			const h1 = $('h1');
			assert.equal(h1.length, 1);
			assert.equal(h1.text(), 'With Layout Prop');

			const h2 = $('h2');
			assert.equal(h2.length, 1);
			assert.equal(h2.text(), 'Content with a layout prop');
		});
	});
});

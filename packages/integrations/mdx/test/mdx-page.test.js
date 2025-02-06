import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

describe('MDX Page', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/mdx-page/', import.meta.url),
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('works', async () => {
			const html = await fixture.readFile('/index.html');
			const { document } = parseHTML(html);

			const h1 = document.querySelector('h1');

			assert.equal(h1.textContent, 'Hello page!');
		});

		it('injects style imports when layout is not applied', async () => {
			const html = await fixture.readFile('/index.html');
			const { document } = parseHTML(html);

			const stylesheet = document.querySelector('link[rel="stylesheet"]');

			assert.notEqual(stylesheet, null);
		});

		it('Renders MDX in utf-8 by default', async () => {
			const html = await fixture.readFile('/chinese-encoding/index.html');
			const $ = cheerio.load(html);
			assert.equal($('h1').text(), '我的第一篇博客文章');
			assert.match(html, /<meta charset="utf-8"/);
		});

		it('Renders MDX with layout frontmatter without utf-8 by default', async () => {
			const html = await fixture.readFile('/chinese-encoding-layout-frontmatter/index.html');
			assert.doesNotMatch(html, /<meta charset="utf-8"/);
		});

		it('Renders MDX with layout manual import without utf-8 by default', async () => {
			const html = await fixture.readFile('/chinese-encoding-layout-manual/index.html');
			assert.doesNotMatch(html, /<meta charset="utf-8"/);
		});
	});

	describe('dev', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('works', async () => {
			const res = await fixture.fetch('/');

			assert.equal(res.status, 200);

			const html = await res.text();
			const { document } = parseHTML(html);

			const h1 = document.querySelector('h1');

			assert.equal(h1.textContent, 'Hello page!');
		});

		it('Renders MDX in utf-8 by default', async () => {
			const res = await fixture.fetch('/chinese-encoding/');
			assert.equal(res.status, 200);
			const html = await res.text();
			const $ = cheerio.load(html);
			assert.equal($('h1').text(), '我的第一篇博客文章');
			assert.doesNotMatch(res.headers.get('content-type'), /charset=utf-8/);
			assert.match(html, /<meta charset="utf-8"/);
		});

		it('Renders MDX with layout frontmatter without utf-8 by default', async () => {
			const res = await fixture.fetch('/chinese-encoding-layout-frontmatter/');
			assert.equal(res.status, 200);
			const html = await res.text();
			assert.doesNotMatch(res.headers.get('content-type'), /charset=utf-8/);
			assert.doesNotMatch(html, /<meta charset="utf-8"/);
		});

		it('Renders MDX with layout manual import without utf-8 by default', async () => {
			const res = await fixture.fetch('/chinese-encoding-layout-manual/');
			assert.equal(res.status, 200);
			const html = await res.text();
			assert.doesNotMatch(res.headers.get('content-type'), /charset=utf-8/);
			assert.doesNotMatch(html, /<meta charset="utf-8"/);
		});
	});
});

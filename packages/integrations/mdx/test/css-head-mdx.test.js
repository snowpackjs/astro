import mdx from '@astrojs/mdx';

import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

describe('Head injection w/ MDX', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/css-head-mdx/', import.meta.url),
			integrations: [mdx()],
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('injects content styles into head', async () => {
			const html = await fixture.readFile('/indexThree/index.html');
			const { document } = parseHTML(html);

			const links = document.querySelectorAll('head link[rel=stylesheet]');
			assert.equal(links.length, 1);

			const scripts = document.querySelectorAll('script[type=module]');
			assert.equal(scripts.length, 1);
		});

		it('injects into the head for content collections', async () => {
			const html = await fixture.readFile('/posts/test/index.html');
			const { document } = parseHTML(html);

			const links = document.querySelectorAll('head link[rel=stylesheet]');
			assert.equal(links.length, 1);
		});

		it('injects content from a component using Content#render()', async () => {
			const html = await fixture.readFile('/DirectContentUsage/index.html');
			const { document } = parseHTML(html);

			const links = document.querySelectorAll('head link[rel=stylesheet]');
			assert.equal(links.length, 1);

			const scripts = document.querySelectorAll('script[type=module]');
			assert.equal(scripts.length, 1);
		});

		it('Using component using slots.render() API', async () => {
			const html = await fixture.readFile('/remote/index.html');
			const { document } = parseHTML(html);

			const links = document.querySelectorAll('head link[rel=stylesheet]');
			assert.equal(links.length, 1);
		});

		it('Using component but no layout', async () => {
			const html = await fixture.readFile('/noLayoutWithComponent/index.html');
			// Using cheerio here because linkedom doesn't support head tag injection
			const $ = cheerio.load(html);

			const headLinks = $('head link[rel=stylesheet]');
			assert.equal(headLinks.length, 1);

			const bodyLinks = $('body link[rel=stylesheet]');
			assert.equal(bodyLinks.length, 0);
		});

		it('JSX component rendering Astro children within head buffering phase', async () => {
			const html = await fixture.readFile('/posts/using-component/index.html');
			// Using cheerio here because linkedom doesn't support head tag injection
			const $ = cheerio.load(html);

			const headLinks = $('head link[rel=stylesheet]');
			assert.equal(headLinks.length, 1);

			const bodyLinks = $('body link[rel=stylesheet]');
			assert.equal(bodyLinks.length, 0);
		});

		it('Injection caused by delayed slots', async () => {
			const html = await fixture.readFile('/componentwithtext/index.html');

			// Using cheerio here because linkedom doesn't support head tag injection
			const $ = cheerio.load(html);

			const headLinks = $('head link[rel=stylesheet]');
			assert.equal(headLinks.length, 1);

			const bodyLinks = $('body link[rel=stylesheet]');
			assert.equal(bodyLinks.length, 0);
		});
	});
});

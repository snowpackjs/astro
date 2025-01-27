import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('CSS ordering - import order', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/css-order-import/',
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
	});

	/**
	 *
	 * @param {string} html
	 * @returns {string[]}
	 */
	function getLinks(html) {
		let $ = cheerio.load(html);
		let out = [];
		$('link[rel=stylesheet]').each((_i, el) => {
			out.push($(el).attr('href'));
		});
		return out;
	}

	function getStyles(html) {
		let $ = cheerio.load(html);
		let out = [];
		$('style').each((_i, el) => {
			out.push($(el).text());
		});
		return out;
	}

	/**
	 *
	 * @param {string} href
	 * @returns {Promise<{ href: string; css: string; }>}
	 */
	async function getLinkContent(href, f = fixture) {
		const css = await f.readFile(href);
		return { href, css };
	}

	describe('Development', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('Page level CSS is defined lower in the page', async () => {
			let res = await fixture.fetch('/');
			let html = await res.text();
			let [style1, style2] = getStyles(html);

			assert.ok(style1.includes('green'));
			assert.ok(style2.includes('salmon'));
		});

		it('import order is depth-first', async () => {
			let res = await fixture.fetch('/component/');
			let html = await res.text();
			let [style1, style2, style3] = getStyles(html);

			assert.ok(style1.includes('burlywood'));
			assert.ok(style2.includes('aliceblue'));
			assert.ok(style3.includes('whitesmoke'));
		});
	});

	describe('Production', () => {
		before(async () => {
			await fixture.build();
		});

		it('Page level CSS is defined lower in the page', async () => {
			let html = await fixture.readFile('/index.html');

			const content = await Promise.all(getLinks(html).map((href) => getLinkContent(href)));

			const [{ css }] = content;
			let idx1 = css.indexOf('salmon');
			let idx2 = css.indexOf('green');

			assert.equal(idx1 > idx2, true, 'Page level CSS should be placed after imported CSS');
		});

		it('import order is depth-first', async () => {
			let html = await fixture.readFile('/component/index.html');

			const content = await Promise.all(getLinks(html).map((href) => getLinkContent(href)));

			const [{ css }] = content;
			let idx1 = css.indexOf('#f5f5f5'); // whitesmoke minified
			let idx2 = css.indexOf('#f0f8ff'); // aliceblue minified
			let idx3 = css.indexOf('#deb887'); // burlywoord minified

			assert.ok(idx1 > idx2);
			assert.ok(idx2 > idx3);
		});

		it('correctly chunks css import from framework components', async () => {
			let html = await fixture.readFile('/index.html');

			const content = await Promise.all(getLinks(html).map((href) => getLinkContent(href)));
			const [, { css }] = content;
			assert.ok(
				!css.includes('.client-1{background:red!important}'),
				'CSS from Client2.jsx leaked into index.astro when chunking',
			);
		});

		it('dedupe css between astro and framework components', async () => {
			let html = await fixture.readFile('/dedupe/index.html');

			const content = await Promise.all(getLinks(html).map((href) => getLinkContent(href)));
			const css = content.map((c) => c.css).join('');
			assert.equal(/\.astro-jsx/.exec(css).length, 1, '.astro-jsx class is duplicated');
		});
	});

	describe('Dynamic import', () => {
		// eslint-disable-next-line @typescript-eslint/no-shadow
		let fixture;
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/css-order-dynamic-import/',
				// test suite was authored when inlineStylesheets defaulted to never
				build: { inlineStylesheets: 'never' },
			});
			await fixture.build();
		});

		it('dynamic imports taken into account', async () => {
			let html = await fixture.readFile('/one/index.html');
			const content = await Promise.all(
				getLinks(html).map((href) => getLinkContent(href, fixture)),
			);
			let [link1, link2] = content;
			assert.ok(link1.css.includes('f0f8ff')); // aliceblue minified
			assert.ok(link2.css.includes('ff0')); // yellow minified
		});
	});
});

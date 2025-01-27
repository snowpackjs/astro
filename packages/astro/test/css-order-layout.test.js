import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('CSS ordering - import order with layouts', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/css-order-layout/',
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

	/**
	 *
	 * @param {string} href
	 * @returns {Promise<{ href: string; css: string; }>}
	 */
	async function getLinkContent(href) {
		const css = await fixture.readFile(href);
		return { href, css };
	}

	describe('Production', () => {
		before(async () => {
			await fixture.build();
		});

		it('Page level CSS is defined lower in the page', async () => {
			let html = await fixture.readFile('/index.html');

			const content = await Promise.all(getLinks(html).map((href) => getLinkContent(href)));

			let specialButtonCSS = -1;
			let globalCSS = -1;
			for (let i = 0; i < content.length; i++) {
				if (content[i].css.includes('.SpecialButton')) {
					specialButtonCSS = i;
				} else if (content[i].css.includes('green')) {
					globalCSS = i;
				}
			}

			assert.equal(globalCSS, 0, 'global css sorted on top');
			assert.equal(specialButtonCSS, 1, 'component level css sorted last');
		});
	});
});

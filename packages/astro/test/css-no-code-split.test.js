import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('vite.build.cssCodeSplit: false', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/css-no-code-split/',
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
		await fixture.build();
	});

	it('loads styles correctly', async () => {
		let html = await fixture.readFile('/index.html');
		let $ = cheerio.load(html);
		const cssHref = $('link[rel=stylesheet][href^=/_astro/]').attr('href');
		assert.match(cssHref, /\/_astro\/style\..*?\.css/);
	});
});

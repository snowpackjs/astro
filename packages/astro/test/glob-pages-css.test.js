import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Astro.glob on pages/ directory', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/glob-pages-css/',
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
		await fixture.build();
	});

	it('It includes styles from child components', async () => {
		let html = await fixture.readFile('/index.html');
		let $ = cheerio.load(html);

		assert.equal($('link[rel=stylesheet]').length, 1);
	});
});

import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import { loadFixture } from './test-utils.js';

// Asset bundling
describe('Page-level styles', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/page-level-styles/',
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
		await fixture.build();
	});

	it("Doesn't add page styles for a page without style imports", async () => {
		let html = await fixture.readFile('/index.html');
		let $ = await cheerioLoad(html);
		assert.equal($('link').length, 0);
	});

	it('Does add page styles for pages with style imports (or deps)', async () => {
		let html = await fixture.readFile('/blog/index.html');
		let $ = await cheerioLoad(html);
		assert.equal($('link').length, 1);
	});
});

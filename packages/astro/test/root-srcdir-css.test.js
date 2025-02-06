import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('srcDir', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/root-srcdir-css/',
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
		await fixture.build();
	});

	it('when the srcDir is "." which parser style in index.astro', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);

		const relPath = $('link').attr('href');
		const css = await fixture.readFile(relPath);
		assert.match(css, /body\{color:green\}/);
	});
});

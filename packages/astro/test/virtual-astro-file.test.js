import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Loading virtual Astro files', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/virtual-astro-file/',
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
		await fixture.build();
	});

	it('renders the component', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		assert.equal($('#something').length, 1);
		assert.equal($('#works').text(), 'true');
	});

	it('builds component CSS', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const href = $('link').attr('href');
		const css = await fixture.readFile(href);
		assert.match(css, /green/, 'css bundled from virtual astro module');
	});
});

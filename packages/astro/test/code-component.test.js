import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Code component', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/code-component/' });
		await fixture.build();
	});

	it('Debug component styles are not included in the page', async () => {
		let html = await fixture.readFile('/index.html');
		let $ = cheerio.load(html);
		assert.equal($('link[rel=stylesheet]').length, 0, 'No styles should be built');
		assert.equal($('style').length, 0);
	});

	it('is:raw attribute not serialized', async () => {
		let html = await fixture.readFile('/index.html');
		let $ = cheerio.load(html);
		assert.equal($('pre').attr('is:raw'), undefined);
	});

	// ViewTransitions bug
	it('No script should be added to the page', async () => {
		let html = await fixture.readFile('/index.html');
		let $ = cheerio.load(html);
		assert.equal($('script').length, 0);
	});
});

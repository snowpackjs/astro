import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Head in its own component', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-head/',
			site: 'https://mysite.dev/',
			base: '/blog',
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
		await fixture.build();
	});

	it('Styles are appended to the head and not the body', async () => {
		let html = await fixture.readFile('/head-own-component/index.html');
		let $ = cheerio.load(html);
		assert.equal($('link[rel=stylesheet]').length, 1, 'one stylesheet overall');
		assert.equal($('head link[rel=stylesheet]').length, 1, 'stylesheet is in the head');
	});
});

import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('@fontsource/* packages', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/fontsource-package/' });
		await fixture.build();
	});

	it('can be imported in frontmatter', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const assetPath = $('link').attr('href');
		const css = await fixture.readFile(assetPath);
		assert.equal(css.includes('Montserrat'), true);
	});
});

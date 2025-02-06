import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Dynamic component fallback', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-fallback',
		});
		await fixture.build();
	});

	it('Shows static content', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		assert.equal($('#fallback').text(), 'static');
	});
});

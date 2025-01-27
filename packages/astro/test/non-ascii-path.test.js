import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Non-ASCII Path Test', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/non-ascii-path/测试/' });
		await fixture.build();
	});

	describe('build', () => {
		it('Can load page', async () => {
			const html = await fixture.readFile(`/index.html`);
			const $ = cheerio.load(html);

			assert.equal($('h1').text(), '测试 OK');
		});
	});
});

import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Unused slot', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/unused-slot/' });
		await fixture.build();
	});

	it('is able to build with the slot missing', async () => {
		let html = await fixture.readFile('/index.html');
		let $ = cheerio.load(html);
		// No children, slot rendered as empty
		assert.equal($('body p').children().length, 0);
	});
});

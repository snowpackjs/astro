import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Matching .astro modules', () => {
	let fixture;
	/** @type {string} */
	let output;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/extension-matching/',
		});
		await fixture.build();
		output = await fixture.readFile('./index.html');
	});

	it('loads virtual modules with .astro in query string', async () => {
		const $ = cheerio.load(output);
		const title = $('h1').text();
		assert.strictEqual(title, 'true');
	});
});

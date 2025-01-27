import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Vue JSX', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/vue-jsx/',
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('Can load Vue JSX', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			const allPreValues = $('pre')
				.toArray()
				.map((el) => $(el).text());

			assert.deepEqual(allPreValues, ['2345', '0', '1', '1', '1', '10', '100', '1000']);
		});
	});
});

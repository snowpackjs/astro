import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Object style', async () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/astro-object-style/' });
		await fixture.build();
	});

	it('Passes style attributes as expected to elements', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);

		assert.equal($('[style="background-color:green"]').length, 1);
		assert.equal($('[style="background-color:red"]').length, 1);
		assert.equal($('[style="background-color:blue"]').length, 1);
		assert.equal($(`[style='background-image:url("a")']`).length, 1);
	});

	it('Passes style attributes as expected to components', async () => {
		const html = await fixture.readFile('/component/index.html');
		const $ = cheerio.load(html);

		assert.equal($('[style="background-color:green"]').length, 1);
		assert.equal($('[style="background-color:red"]').length, 1);
		assert.equal($('[style="background-color:blue"]').length, 1);
		assert.equal($(`[style='background-image:url("a")']`).length, 1);
	});
});

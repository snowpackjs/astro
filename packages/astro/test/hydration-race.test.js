import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Hydration script ordering', async () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/hydration-race' });
		await fixture.build();
	});

	it('Places the hydration script before the first island', async () => {
		let html = await fixture.readFile('/index.html');
		let $ = cheerio.load(html);

		// First, let's make sure all islands rendered (or test is bad)
		assert.equal($('astro-island').length, 3);

		// Now let's make sure the hydration script is placed before the first component
		let firstIsland = $($('astro-island').get(0));
		let prevSibling = firstIsland.prev();
		assert.equal(prevSibling.prop('tagName'), 'SCRIPT');

		// Sanity check that we're only rendering them once.
		assert.equal($('style').length, 1, 'hydration style added once');
		assert.equal($('script').length, 1, 'only one hydration script needed');
	});

	it('Hydration script included when inside dynamic slot', async () => {
		let html = await fixture.readFile('/slot/index.html');
		let $ = cheerio.load(html);

		// First, let's make sure all islands rendered
		assert.equal($('astro-island').length, 1);

		// There should be 1 script
		assert.equal($('script').length, 1);
	});
});

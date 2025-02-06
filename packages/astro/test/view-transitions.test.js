import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('View Transitions styles', () => {
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/view-transitions/' });
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('style tag added for each instance of the component', async () => {
		let res = await fixture.fetch('/multiple');
		let html = await res.text();
		let $ = cheerio.load(html);

		assert.equal($('head style').length, 3);
	});

	it('should not duplicate transition attributes on island contents', async () => {
		let res = await fixture.fetch('/hasIsland');
		let html = await res.text();
		let $ = cheerio.load(html);
		assert.equal($('astro-island[data-astro-transition-persist]').length, 1);
		assert.equal(
			$('astro-island[data-astro-transition-persist] > [data-astro-transition-persist]').length,
			0,
		);
	});
});

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Projects with a space in the folder name', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/space in folder name/app/',
		});
	});

	describe('dev', () => {
		/** @type {import('./test-utils').Fixture} */
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('Work with scripts', async () => {
			const html = await fixture.fetch('/').then((r) => r.text());
			const $ = cheerio.load(html);

			assert.equal($('script[src*="/src/pages/index.astro"]').length, 1);
		});
	});
});

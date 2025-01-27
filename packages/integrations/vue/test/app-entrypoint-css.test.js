import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('App Entrypoint CSS', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/app-entrypoint-css/',
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('injects styles referenced in appEntrypoint', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerioLoad(html);

			// test 1: basic component renders
			assert.equal($('#foo > #bar').text(), 'works');
			// test 2: injects the global style on the page
			assert.equal($('style').first().text().trim(), ':root{background-color:red}');
		});

		it('does not inject styles to pages without a Vue component', async () => {
			const html = await fixture.readFile('/unrelated/index.html');
			const $ = cheerioLoad(html);

			assert.equal($('style').length, 0);
			assert.equal($('link[rel="stylesheet"]').length, 0);
		});
	});

	describe('dev', () => {
		let devServer;
		before(async () => {
			devServer = await fixture.startDevServer();
		});
		after(async () => {
			await devServer.stop();
		});

		it('loads during SSR', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			// test 1: basic component renders
			assert.equal($('#foo > #bar').text(), 'works');
			// test 2: injects the global style on the page
			assert.equal($('style').first().text().replace(/\s+/g, ''), ':root{background-color:red;}');
		});

		it('does not inject styles to pages without a Vue component', async () => {
			const html = await fixture.fetch('/unrelated').then((res) => res.text());
			const $ = cheerioLoad(html);

			assert.equal($('style').length, 0);
			assert.equal($('link[rel="stylesheet"]').length, 0);
		});
	});
});

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Partials', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/partials/',
		});
	});

	describe('dev', () => {
		/** @type {import('./test-utils.js').DevServer} */
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('is only the written HTML', async () => {
			const html = await fixture.fetch('/partials/item/').then((res) => res.text());
			assert.equal(html.startsWith('<li'), true);
		});

		it('Nested conditionals render', async () => {
			const html = await fixture.fetch('/partials/nested-conditional/').then((res) => res.text());
			const $ = cheerio.load(html);
			assert.equal($('#true').text(), 'test');
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('is only the written HTML', async () => {
			const html = await fixture.readFile('/partials/item/index.html');
			assert.equal(html.startsWith('<li>'), true);
		});

		it('Works with mdx', async () => {
			const html = await fixture.readFile('/partials/docs/index.html');
			assert.equal(html.startsWith('<h1'), true);
		});
	});
});

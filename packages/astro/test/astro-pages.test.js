import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { isWindows, loadFixture } from './test-utils.js';

describe('Pages', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/astro pages/' });
		await fixture.build();
	});

	describe('Build', () => {
		before(async () => {
			await fixture.build();
		});

		it('Can find page with "index" at the end file name', async () => {
			const html = await fixture.readFile('/posts/name-with-index/index.html');
			const $ = cheerio.load(html);

			assert.equal($('h1').text(), 'Name with index');
		});

		it('Can find page with quotes in file name', async () => {
			const html = await fixture.readFile("/quotes'-work-too/index.html");
			const $ = cheerio.load(html);

			assert.equal($('h1').text(), 'Quotes work too');
		});
	});

	if (isWindows) return;

	describe('Development', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('Is able to load md pages', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerio.load(html);

			assert.equal($('#testing').length > 0, true);
		});

		it('should have Vite client in dev', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			assert.equal(
				html.includes('/@vite/client'),
				true,
				'Markdown page does not have Vite client for HMR',
			);
		});
	});
});

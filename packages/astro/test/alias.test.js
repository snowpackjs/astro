import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { isWindows, loadFixture } from './test-utils.js';

describe('Aliases', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/alias/',
		});
	});

	if (isWindows) return;

	describe('dev', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('can load client components', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerio.load(html);

			// Should render aliased element
			assert.equal($('#client').text(), 'test');

			const scripts = $('script').toArray();
			assert.ok(scripts.length > 0);
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('can load client components', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			// Should render aliased element
			assert.equal($('#client').text(), 'test');

			const scripts = $('script').toArray();
			assert.ok(scripts.length > 0);
		});

		it('can use aliases and relative in same project', async () => {
			const html = await fixture.readFile('/two/index.html');
			const $ = cheerio.load(html);

			// Should render aliased element
			assert.equal($('#client').text(), 'test');

			const scripts = $('script').toArray();
			assert.ok(scripts.length > 0);
		});
	});
});

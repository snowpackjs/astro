import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import { loadFixture } from '../../astro/test/test-utils.js';

describe('astro:db with integrations', () => {
	let fixture;
	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/integrations/', import.meta.url),
		});
	});

	describe('development', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('Prints the list of authors from user-defined table', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			const ul = $('.authors-list');
			assert.equal(ul.children().length, 5);
			assert.match(ul.children().eq(0).text(), /Ben/);
		});

		it('Prints the list of menu items from integration-defined table', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			const ul = $('ul.menu');
			assert.equal(ul.children().length, 4);
			assert.match(ul.children().eq(0).text(), /Pancakes/);
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('Prints the list of authors from user-defined table', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerioLoad(html);

			const ul = $('.authors-list');
			assert.equal(ul.children().length, 5);
			assert.match(ul.children().eq(0).text(), /Ben/);
		});

		it('Prints the list of menu items from integration-defined table', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerioLoad(html);

			const ul = $('ul.menu');
			assert.equal(ul.children().length, 4);
			assert.match(ul.children().eq(0).text(), /Pancakes/);
		});
	});
});

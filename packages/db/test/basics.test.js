import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import testAdapter from '../../astro/test/test-adapter.js';
import { loadFixture } from '../../astro/test/test-utils.js';
import { clearEnvironment, setupRemoteDbServer } from './test-utils.js';

describe('astro:db', () => {
	let fixture;
	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/basics/', import.meta.url),
			output: 'server',
			adapter: testAdapter(),
		});
	});

	describe({ skip: process.platform === 'darwin' }, 'development', () => {
		let devServer;

		before(async () => {
			clearEnvironment();
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('Prints the list of authors', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			const ul = $('.authors-list');
			assert.equal(ul.children().length, 5);
			assert.match(ul.children().eq(0).text(), /Ben/);
		});

		it('Allows expression defaults for date columns', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			const themeAdded = $($('.themes-list .theme-added')[0]).text();
			assert.equal(Number.isNaN(new Date(themeAdded).getTime()), false);
		});

		it('Defaults can be overridden for dates', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			const themeAdded = $($('.themes-list .theme-added')[1]).text();
			assert.equal(Number.isNaN(new Date(themeAdded).getTime()), false);
		});

		it('Allows expression defaults for text columns', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			const themeOwner = $($('.themes-list .theme-owner')[0]).text();
			assert.equal(themeOwner, '');
		});

		it('Allows expression defaults for boolean columns', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			const themeDark = $($('.themes-list .theme-dark')[0]).text();
			assert.match(themeDark, /dark mode/);
		});

		it('text fields an be used as references', async () => {
			const html = await fixture.fetch('/login').then((res) => res.text());
			const $ = cheerioLoad(html);

			assert.match($('.session-id').text(), /12345/);
			assert.match($('.username').text(), /Mario/);
		});

		it('Prints authors from raw sql call', async () => {
			const json = await fixture.fetch('run.json').then((res) => res.json());
			assert.deepEqual(json, {
				columns: ['_id', 'name', 'age2'],
				columnTypes: ['INTEGER', 'TEXT', 'INTEGER'],
				rows: [
					[1, 'Ben', null],
					[2, 'Nate', null],
					[3, 'Erika', null],
					[4, 'Bjorn', null],
					[5, 'Sarah', null],
				],
				rowsAffected: 0,
				lastInsertRowid: null,
			});
		});
	});

	describe({ skip: process.platform === 'darwin' }, 'development --remote', () => {
		let devServer;
		let remoteDbServer;

		before(async () => {
			clearEnvironment();
			remoteDbServer = await setupRemoteDbServer(fixture.config);
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer?.stop();
			await remoteDbServer?.stop();
		});

		it('Prints the list of authors', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			const ul = $('.authors-list');
			assert.equal(ul.children().length, 5);
			assert.match(ul.children().eq(0).text(), /Ben/);
		});

		it('Allows expression defaults for date columns', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			const themeAdded = $($('.themes-list .theme-added')[0]).text();
			assert.equal(Number.isNaN(new Date(themeAdded).getTime()), false);
		});

		it('Defaults can be overridden for dates', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			const themeAdded = $($('.themes-list .theme-added')[1]).text();
			assert.equal(Number.isNaN(new Date(themeAdded).getTime()), false);
		});

		it('Allows expression defaults for text columns', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			const themeOwner = $($('.themes-list .theme-owner')[0]).text();
			assert.equal(themeOwner, '');
		});

		it('Allows expression defaults for boolean columns', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			const themeDark = $($('.themes-list .theme-dark')[0]).text();
			assert.match(themeDark, /dark mode/);
		});

		it('text fields an be used as references', async () => {
			const html = await fixture.fetch('/login').then((res) => res.text());
			const $ = cheerioLoad(html);

			assert.match($('.session-id').text(), /12345/);
			assert.match($('.username').text(), /Mario/);
		});

		it('Prints authors from raw sql call', async () => {
			const json = await fixture.fetch('run.json').then((res) => res.json());
			assert.deepEqual(json, {
				columns: ['_id', 'name', 'age2'],
				columnTypes: ['INTEGER', 'TEXT', 'INTEGER'],
				rows: [
					[1, 'Ben', null],
					[2, 'Nate', null],
					[3, 'Erika', null],
					[4, 'Bjorn', null],
					[5, 'Sarah', null],
				],
				rowsAffected: 0,
				lastInsertRowid: null,
			});
		});
	});

	describe('build --remote', () => {
		let remoteDbServer;

		before(async () => {
			clearEnvironment();
			process.env.ASTRO_STUDIO_APP_TOKEN = 'some token';
			remoteDbServer = await setupRemoteDbServer(fixture.config);
			await fixture.build();
		});

		after(async () => {
			process.env.ASTRO_STUDIO_APP_TOKEN = '';
			await remoteDbServer?.stop();
		});

		it('Can render page', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/');
			const response = await app.render(request);
			const html = await response.text();
			const $ = cheerioLoad(html);

			const ul = $('.authors-list');
			assert.equal(ul.children().length, 5);
		});
	});
});

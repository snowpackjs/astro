import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Preact compat component', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/preact-compat-component/',
		});
	});

	describe('Development', () => {
		/** @type {import('./test-utils.js').DevServer} */
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('Can load Counter', async () => {
			const res = await fixture.fetch('/');
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal($('#counter-text').text(), '0');
		});
	});

	describe('Build', () => {
		before(async () => {
			await fixture.build();
		});

		it('Can load Counter', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#counter-text').text(), '0');
		});
	});
});

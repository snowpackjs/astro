import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { isWindows, loadFixture } from './test-utils.js';

describe('Svelte component', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/svelte-component/',
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('Works with TypeScript', async () => {
			const html = await fixture.readFile('/typescript/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#svelte-ts').text(), 'Hello, TypeScript');
		});

		it('Works with custom Svelte config', async () => {
			const html = await fixture.readFile('/typescript/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#svelte-custom-ext').text(), 'Hello, Custom Extensions');
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

		it('scripts proxy correctly', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerio.load(html);

			for (const script of $('script').toArray()) {
				const { src } = script.attribs;

				if (!src) continue;

				assert.equal((await fixture.fetch(src)).status, `404: ${src}`, 200);
			}
		});
	});
});

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('HTML Escape', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/html-escape/',
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('works', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			const div = $('div');
			assert.equal(div.text(), '${foo}');

			const span = $('span');
			assert.equal(span.attr('${attr}'), '');

			const ce = $('custom-element');
			assert.equal(ce.attr('x-data'), '`${test}`');

			const script = $('script');
			assert.equal(script.text(), 'console.log(`hello ${"world"}!`)');
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

		it('works', async () => {
			const res = await fixture.fetch('/');

			assert.equal(res.status, 200);

			const html = await res.text();
			const $ = cheerio.load(html);

			const div = $('div');
			assert.equal(div.text(), '${foo}');

			const span = $('span');
			assert.equal(span.attr('${attr}'), '');

			const ce = $('custom-element');
			assert.equal(ce.attr('x-data'), '`${test}`');

			const script = $('script');
			assert.equal(script.text(), 'console.log(`hello ${"world"}!`)');
		});
	});
});

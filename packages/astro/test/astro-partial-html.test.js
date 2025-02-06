import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Partial HTML', async () => {
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-partial-html/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('injects Astro styles and scripts', async () => {
		const html = await fixture.fetch('/astro').then((res) => res.text());
		const $ = cheerio.load(html);

		// test 1: Doctype first
		assert.match(html, /^<!DOCTYPE html/);

		// test 2: correct CSS present
		const allInjectedStyles = $('style').text();
		assert.match(allInjectedStyles, /\[data-astro-cid-[^{]+\{color:red\}/);
	});

	it('injects framework styles', async () => {
		const html = await fixture.fetch('/jsx').then((res) => res.text());
		const $ = cheerio.load(html);

		// test 1: Doctype first
		assert.match(html, /^<!DOCTYPE html/);

		// test 2: link tag present
		const allInjectedStyles = $('style').text().replace(/\s*/g, '');
		assert.match(allInjectedStyles, /h1\{color:red;\}/);
	});

	it('pages with a head, injection happens inside', async () => {
		const html = await fixture.fetch('/with-head').then((res) => res.text());
		const $ = cheerio.load(html);
		assert.equal($('style').length, 1);
	});
});

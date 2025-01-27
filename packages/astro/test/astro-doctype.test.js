import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Doctype', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/astro-doctype/' });
		await fixture.build();
	});

	it('Automatically prepends the standards mode doctype', async () => {
		const html = await fixture.readFile('/prepend/index.html');

		// test that Doctype always included
		assert.match(html, /^<!DOCTYPE html>/i);
	});

	it('No attributes added when doctype is provided by user', async () => {
		const html = await fixture.readFile('/provided/index.html');

		// test that Doctype always included
		assert.match(html, /^<!DOCTYPE html>/i);
	});

	it.skip('Preserves user provided doctype', async () => {
		const html = await fixture.readFile('/preserve/index.html');

		// test that Doctype included was preserved
		assert.match(
			html,
			/^<!DOCTYPE html PUBLIC "-\/\/W3C\/\/DTD HTML 4.01 Transitional\/\/EN" "http:\/\/www.w3.org\/TR\/html4\/loose.dtd">/i,
		);
	});

	it('User provided doctype is case insensitive', async () => {
		const html = await fixture.readFile('/capital/index.html');

		// test 1: Doctype left alone
		assert.match(html, /^<!DOCTYPE html>/i);

		// test 2: no closing tag
		assert.doesNotMatch(html, /<\/!DOCTYPE>/i);
	});

	it.skip('Doctype can be provided in a layout', async () => {
		const html = await fixture.readFile('/in-layout/index.html');

		// test 1: doctype is at the front
		assert.match(html, /^<!DOCTYPE html>/i);

		// test 2: A link inside of the head
		const $ = cheerio.load(html);
		assert.equal($('head link').length, 1);
	});

	it('Doctype is added in a layout without one', async () => {
		const html = await fixture.readFile('/in-layout-no-doctype/index.html');

		// test that doctype is at the front
		assert.match(html, /^<!DOCTYPE html>/i);
	});

	it('Doctype is added in a layout used with markdown pages', async () => {
		const html = await fixture.readFile('/in-layout-article/index.html');

		// test 1: doctype is at the front
		assert.match(html, /^<!DOCTYPE html>/i);

		// test 2: A link inside of the head
		const $ = cheerio.load(html);
		assert.equal($('head link').length, 1);
	});
});

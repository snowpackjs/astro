import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('scopedStyleStrategy', () => {
	describe('scopedStyleStrategy: "where"', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		let stylesheet;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/scoped-style-strategy/',
				scopedStyleStrategy: 'where',
				// test suite was authored when inlineStylesheets defaulted to never
				build: { inlineStylesheets: 'never' },
			});
			await fixture.build();

			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			const $link = $('link[rel=stylesheet]');
			const href = $link.attr('href');
			stylesheet = await fixture.readFile(href);
		});

		it('includes :where pseudo-selector', () => {
			assert.match(stylesheet, /:where/);
		});

		it('does not includes the class name directly in the selector', () => {
			assert.doesNotMatch(stylesheet, /h1\.astro/);
		});
	});

	describe('scopedStyleStrategy: "class"', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		let stylesheet;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/scoped-style-strategy/',
				scopedStyleStrategy: 'class',
				// test suite was authored when inlineStylesheets defaulted to never
				build: { inlineStylesheets: 'never' },
			});
			await fixture.build();

			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			const $link = $('link[rel=stylesheet]');
			const href = $link.attr('href');
			stylesheet = await fixture.readFile(href);
		});

		it('does not include :where pseudo-selector', () => {
			assert.doesNotMatch(stylesheet, /:where/);
		});

		it('includes the class name directly in the selector', () => {
			assert.match(stylesheet, /h1\.astro/);
		});
	});

	describe('default', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		let stylesheet;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/scoped-style-strategy/',
				// test suite was authored when inlineStylesheets defaulted to never
				build: { inlineStylesheets: 'never' },
			});
			await fixture.build();

			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			const $link = $('link[rel=stylesheet]');
			const href = $link.attr('href');
			stylesheet = await fixture.readFile(href);
		});

		it('does not include :where pseudo-selector', () => {
			assert.doesNotMatch(stylesheet, /:where/);
		});

		it('does not include the class name directly in the selector', () => {
			assert.doesNotMatch(stylesheet, /h1\.astro/);
		});

		it('includes the data attribute hash', () => {
			assert.equal(stylesheet.includes('h1[data-astro-cid-'), true);
		});
	});
});

import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('build.format', () => {
	describe('directory', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/page-format/',
			});
		});

		describe('Build', () => {
			before(async () => {
				await fixture.build();
			});

			it('relative urls created point to sibling folders', async () => {
				let html = await fixture.readFile('/nested/page/index.html');
				let $ = cheerio.load(html);
				assert.equal($('#another').attr('href'), '/nested/page/another/');
			});
		});
	});

	describe('file', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/page-format/',
				build: {
					format: 'file',
				},
			});
		});

		describe('Build', () => {
			before(async () => {
				await fixture.build();
			});

			it('relative urls created point to sibling folders', async () => {
				let html = await fixture.readFile('/nested/page.html');
				let $ = cheerio.load(html);
				assert.equal($('#another').attr('href'), '/nested/another/');
			});
		});
	});

	describe('preserve - i18n', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		before(async () => {
			fixture = await loadFixture({
				base: '/test',
				root: './fixtures/page-format/',
				trailingSlash: 'always',
				build: {
					format: 'preserve',
				},
			});
		});

		describe('Build', () => {
			before(async () => {
				await fixture.build();
			});

			it('Astro.url points to right file', async () => {
				let html = await fixture.readFile('/nested/index.html');
				let $ = cheerio.load(html);
				assert.equal($('h2').text(), '/test/nested/');
			});
		});
	});

	describe('preserve - i18n', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		before(async () => {
			fixture = await loadFixture({
				base: '/test',
				root: './fixtures/page-format/',
				trailingSlash: 'always',
				build: {
					format: 'preserve',
				},
				i18n: {
					locales: ['en'],
					defaultLocale: 'en',
					routing: {
						prefixDefaultLocale: true,
						redirectToDefaultLocale: true,
					},
				},
			});
		});

		describe('Build', () => {
			before(async () => {
				await fixture.build();
			});

			it('relative urls created point to sibling folders', async () => {
				let html = await fixture.readFile('/en/nested/page.html');
				let $ = cheerio.load(html);
				assert.equal($('#another').attr('href'), '/test/en/nested/page/another/');
			});

			it('index files are written as index.html', async () => {
				let html = await fixture.readFile('/en/nested/index.html');
				let $ = cheerio.load(html);
				assert.equal($('h1').text(), 'Testing');
			});
		});
	});
});

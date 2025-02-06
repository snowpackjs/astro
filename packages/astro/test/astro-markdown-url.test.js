import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Astro Markdown URL', () => {
	describe('With subpath', () => {
		const baseUrl = `/my-cool-base/docs/pages/how-to-make-a-page`;

		it('trailingSlash: always', async () => {
			let fixture = await loadFixture({
				root: './fixtures/astro-markdown-url/',
				outDir: './with-subpath-always',
				base: '/my-cool-base',
				trailingSlash: 'always',
			});
			await fixture.build();

			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#url').attr('href'), baseUrl + '/');
		});

		it('trailingSlash: never', async () => {
			let fixture = await loadFixture({
				root: './fixtures/astro-markdown-url/',
				outDir: './with-subpath-never',
				base: '/my-cool-base',
				trailingSlash: 'never',
			});
			await fixture.build();

			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#url').attr('href'), baseUrl);
		});

		it('trailingSlash: ignore', async () => {
			let fixture = await loadFixture({
				root: './fixtures/astro-markdown-url/',
				outDir: './with-subpath-ignore',
				base: '/my-cool-base',
				trailingSlash: 'ignore',
			});
			await fixture.build();

			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#url').attr('href'), baseUrl);
		});
	});

	describe('Without subpath', () => {
		const baseUrl = `/docs/pages/how-to-make-a-page`;

		it('trailingSlash: always', async () => {
			let fixture = await loadFixture({
				root: './fixtures/astro-markdown-url/',
				outDir: './without-subpath-always',
				trailingSlash: 'always',
			});
			await fixture.build();

			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#url').attr('href'), baseUrl + '/');
		});

		it('trailingSlash: never', async () => {
			let fixture = await loadFixture({
				root: './fixtures/astro-markdown-url/',
				outDir: './without-subpath-never',
				trailingSlash: 'never',
			});
			await fixture.build();

			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#url').attr('href'), baseUrl);
		});

		it('trailingSlash: ignore', async () => {
			let fixture = await loadFixture({
				root: './fixtures/astro-markdown-url/',
				outDir: './without-subpath-ignore',
				trailingSlash: 'ignore',
			});
			await fixture.build();

			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#url').attr('href'), baseUrl);
		});
	});
});

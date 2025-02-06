import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Tailwind', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/tailwindcss/',
		});
	});

	// test HTML and CSS contents for accuracy
	describe('build', () => {
		let $;
		let bundledCSS;

		before(async () => {
			await fixture.build();

			// get bundled CSS (will be hashed, hence DOM query)
			const html = await fixture.readFile('/index.html');
			$ = cheerio.load(html);
			const bundledCSSHREF = $('link[rel=stylesheet][href^=/_astro/]').attr('href');
			bundledCSS = await fixture.readFile(bundledCSSHREF.replace(/^\/?/, '/'));
		});

		it('resolves CSS in src/styles', async () => {
			assert.match(bundledCSS, /\.bg-purple-600\{/, 'includes used component classes');

			// tests a random tailwind class that isn't used on the page
			assert.doesNotMatch(bundledCSS, /\.bg-blue-600\{/, 'purges unused classes');

			// tailwind escapes colons, `lg:py-3` compiles to `lg\:py-3`
			assert.match(bundledCSS, /\.lg\\:py-3\{/, 'includes responsive classes');

			// tailwind escapes brackets, `font-[900]` compiles to `font-\[900\]`
			assert.match(bundledCSS, /\.font-\\\[900\\\]\{/, 'supports arbitrary value classes');

			// custom theme colors were included
			assert.match(bundledCSS, /\.text-midnight\{/, 'includes custom theme colors');
			assert.match(bundledCSS, /\.bg-dawn\{/, 'includes custom theme colors');
		});

		it('maintains classes in HTML', async () => {
			const button = $('button');

			assert.equal(button.hasClass('text-white'), true, 'basic class');
			assert.equal(button.hasClass('lg:py-3'), true, 'responsive class');
			assert.equal(button.hasClass('font-[900]'), true, 'arbitrary value');
		});

		it('handles complex classes in HTML', async () => {
			const button = $('#complex');

			assert.equal(button.hasClass('w-10/12'), true, 'solidus');
			assert.equal(button.hasClass('2xl:w-[80%]'), true, 'complex class');
		});

		it('handles MDX pages (with integration)', async () => {
			const html = await fixture.readFile('/mdx-page/index.html');
			const $md = cheerio.load(html);
			const bundledCSSHREF = $md('link[rel=stylesheet][href^=/_astro/]').attr('href');
			const mdBundledCSS = await fixture.readFile(bundledCSSHREF.replace(/^\/?/, '/'));
			assert.match(mdBundledCSS, /\.bg-purple-600\{/, 'includes used component classes');
		});
	});
});

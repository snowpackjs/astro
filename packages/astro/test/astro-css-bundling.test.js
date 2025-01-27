import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

// note: the hashes should be deterministic, but updating the file contents will change hashes
// be careful not to test that the HTML simply contains CSS, because it always will! filename and quantity matter here (bundling).
const EXPECTED_CSS = {
	'/index.html': ['/_astro/'], // don’t match hashes, which change based on content
	'/one/index.html': ['/_astro/'],
	'/two/index.html': ['/_astro/'],
};
const UNEXPECTED_CSS = [
	'/src/components/nav.css',
	'../css/typography.css',
	'../css/colors.css',
	'../css/page-index.css',
	'../css/page-one.css',
	'../css/page-two.css',
];

describe('CSS Bundling', function () {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	describe('defaults', () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-css-bundling/',
				// test suite was authored when inlineStylesheets defaulted to never
				build: { inlineStylesheets: 'never' },
			});
			await fixture.build({ mode: 'production' });
		});

		it('Bundles CSS', async () => {
			const builtCSS = new Set();

			// for all HTML files…
			for (const [filepath, css] of Object.entries(EXPECTED_CSS)) {
				const html = await fixture.readFile(filepath);
				const $ = cheerio.load(html);

				// test 1: assert new bundled CSS is present
				for (const href of css) {
					const link = $(`link[rel="stylesheet"][href^="${href}"]`);
					assert.equal(link.length >= 1, true);
					const outHref = link.attr('href');
					builtCSS.add(outHref.startsWith('../') ? outHref.slice(2) : outHref);
				}

				// test 2: assert old CSS was removed
				for (const href of UNEXPECTED_CSS) {
					const link = $(`link[rel="stylesheet"][href="${href}"]`);
					assert.equal(link.length, 0);
				}

				// test 3: assert all bundled CSS was built and contains CSS
				for (const url of builtCSS.keys()) {
					const bundledCss = await fixture.readFile(url);
					assert.ok(bundledCss);
				}
			}
		});

		it('there are 4 css files', async () => {
			const dir = await fixture.readdir('/_astro');
			assert.equal(dir.length, 4);
		});

		it('CSS includes hashes', async () => {
			const [firstFound] = await fixture.readdir('/_astro');
			assert.match(firstFound, /[a-z]+\.[\w-]{8}\.css/);
		});
	});

	describe('using custom assetFileNames config', () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-css-bundling/',

				// test suite was authored when inlineStylesheets defaulted to never
				build: { inlineStylesheets: 'never' },

				vite: {
					build: {
						rollupOptions: {
							output: {
								assetFileNames: 'assets/[name][extname]',
								entryFileNames: '[name].js',
							},
						},
					},
				},
			});
			await fixture.build({ mode: 'production' });
		});

		it('there are 4 css files', async () => {
			const dir = await fixture.readdir('/assets');
			assert.equal(dir.length, 4);
		});

		it('CSS does not include hashes', async () => {
			const [firstFound] = await fixture.readdir('/assets');
			assert.doesNotMatch(firstFound, /[a-z]+\.[\da-z]{8}\.css/);
		});

		it('there are 2 index named CSS files', async () => {
			const dir = await fixture.readdir('/assets');
			const indexNamedFiles = dir.filter((name) => name.startsWith('index'));
			assert.equal(indexNamedFiles.length, 2);
		});
	});
});

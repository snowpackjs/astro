import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Environment Variables', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-envs/',
		});
	});

	describe('Build', () => {
		before(async () => {
			await fixture.build();
		});

		it('builds without throwing', async () => {
			assert.equal(true, true);
		});

		it('does render public env and private env', async () => {
			let indexHtml = await fixture.readFile('/index.html');

			assert.equal(indexHtml.includes('CLUB_33'), true);
			assert.equal(indexHtml.includes('BLUE_BAYOU'), true);
		});

		it('does render destructured public env and private env', async () => {
			let indexHtml = await fixture.readFile('/destructured/index.html');

			assert.equal(indexHtml.includes('CLUB_33'), true);
			assert.equal(indexHtml.includes('BLUE_BAYOU'), true);
		});

		it('does render builtin SITE env', async () => {
			let indexHtml = await fixture.readFile('/index.html');
			assert.equal(indexHtml.includes('http://example.com'), true);
		});

		it('does render destructured builtin SITE env', async () => {
			let indexHtml = await fixture.readFile('/destructured/index.html');

			assert.equal(indexHtml.includes('http://example.com'), true);
		});

		it('does render builtin BASE_URL env', async () => {
			let indexHtml = await fixture.readFile('/index.html');
			assert.equal(indexHtml.includes('/blog'), true);
		});

		it('includes public env in client-side JS', async () => {
			let dirs = await fixture.readdir('/_astro');
			let found = false;

			// Look in all of the .js files to see if the public env is inlined.
			// Testing this way prevents hardcoding expected js files.
			// If we find it in any of them that's good enough to know its working.
			await Promise.all(
				dirs.map(async (path) => {
					if (path.endsWith('.js')) {
						let js = await fixture.readFile(`/_astro/${path}`);
						if (js.includes('BLUE_BAYOU')) {
							found = true;
						}
					}
				}),
			);

			assert.equal(found, true, 'found the public env variable in the JS build');
		});

		it('does not include private env in client-side JS', async () => {
			let dirs = await fixture.readdir('/');
			let found = false;

			// Look in all of the .js files to see if the public env is inlined.
			// Testing this way prevents hardcoding expected js files.
			// If we find it in any of them that's good enough to know it's NOT working.
			await Promise.all(
				dirs.map(async (path) => {
					if (path.endsWith('.js')) {
						let js = await fixture.readFile(`/${path}`);
						if (js.includes('CLUB_33')) {
							found = true;
						}
					}
				}),
			);

			assert.equal(found, false, 'found the private env variable in the JS build');
		});
	});

	describe('Development', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;
		before(async () => {
			devServer = await fixture.startDevServer();
		});
		after(async () => {
			await devServer.stop();
		});

		it('does render builtin BASE_URL env', async () => {
			let res = await fixture.fetch('/blog/');
			assert.equal(res.status, 200);
			let indexHtml = await res.text();
			let $ = cheerio.load(indexHtml);
			assert.equal($('#base-url').text(), '/blog');
		});

		it('does render destructured builtin SITE env', async () => {
			let res = await fixture.fetch('/blog/destructured/');
			assert.equal(res.status, 200);
			let indexHtml = await res.text();
			let $ = cheerio.load(indexHtml);
			assert.equal($('#base-url').text(), '/blog');
		});

		it('does not inject env into imported asset files', async () => {
			let res = await fixture.fetch('/blog/');
			assert.equal(res.status, 200);
			let indexHtml = await res.text();
			let $ = cheerio.load(indexHtml);
			assert.equal($('#env').text(), 'A MYSTERY');
			assert.equal($('#css').text(), 'good');
		});
	});
});

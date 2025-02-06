import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Preview Routing', () => {
	describe('build format: directory', () => {
		describe('Subpath without trailing slash and trailingSlash: never', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;
			/** @type {import('./test-utils').PreviewServer} */
			let previewServer;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/with-subpath-no-trailing-slash/',
					base: '/blog',
					outDir: './dist-4000',
					build: {
						format: 'directory',
					},
					trailingSlash: 'never',
					server: {
						port: 4000,
					},
				});
				await fixture.build();
				previewServer = await fixture.preview();
			});

			after(async () => {
				await previewServer.stop();
			});

			it('404 when loading /', async () => {
				const response = await fixture.fetch('/');
				assert.equal(response.status, 404);
			});

			it('200 when loading subpath root with trailing slash', async () => {
				const response = await fixture.fetch('/blog/');
				assert.equal(response.status, 200);
				assert.equal(response.redirected, false);
			});

			it('200 when loading subpath root without trailing slash', async () => {
				const response = await fixture.fetch('/blog');
				assert.equal(response.status, 200);
				assert.equal(response.redirected, false);
			});

			it('404 when loading another page with subpath used', async () => {
				const response = await fixture.fetch('/blog/another/');
				assert.equal(response.status, 404);
			});

			it('200 when loading dynamic route', async () => {
				const response = await fixture.fetch('/blog/1');
				assert.equal(response.status, 200);
			});

			it('404 when loading invalid dynamic route', async () => {
				const response = await fixture.fetch('/blog/2');
				assert.equal(response.status, 404);
			});
		});

		describe('Subpath without trailing slash and trailingSlash: always', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;
			/** @type {import('./test-utils').PreviewServer} */
			let previewServer;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/with-subpath-no-trailing-slash/',
					base: '/blog',
					outDir: './dist-4001',
					trailingSlash: 'always',
					server: {
						port: 4001,
					},
				});
				await fixture.build();
				previewServer = await fixture.preview();
			});

			after(async () => {
				await previewServer.stop();
			});

			it('404 when loading /', async () => {
				const response = await fixture.fetch('/');
				assert.equal(response.status, 404);
			});

			it('200 when loading subpath root with trailing slash', async () => {
				const response = await fixture.fetch('/blog/');
				assert.equal(response.status, 200);
			});

			it('404 when loading subpath root without trailing slash', async () => {
				const response = await fixture.fetch('/blog');
				assert.equal(response.status, 404);
			});

			it('200 when loading another page with subpath used', async () => {
				const response = await fixture.fetch('/blog/another/');
				assert.equal(response.status, 200);
			});

			it('404 when loading another page with subpath not used', async () => {
				const response = await fixture.fetch('/blog/another');
				assert.equal(response.status, 404);
			});

			it('200 when loading dynamic route', async () => {
				const response = await fixture.fetch('/blog/1/');
				assert.equal(response.status, 200);
			});

			it('404 when loading invalid dynamic route', async () => {
				const response = await fixture.fetch('/blog/2/');
				assert.equal(response.status, 404);
			});
		});

		describe('Subpath without trailing slash and trailingSlash: ignore', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;
			/** @type {import('./test-utils').PreviewServer} */
			let previewServer;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/with-subpath-no-trailing-slash/',
					base: '/blog',
					outDir: './dist-4002',
					trailingSlash: 'ignore',
					server: {
						port: 4002,
					},
				});
				await fixture.build();
				previewServer = await fixture.preview();
			});

			after(async () => {
				await previewServer.stop();
			});

			it('404 when loading /', async () => {
				const response = await fixture.fetch('/');
				assert.equal(response.status, 404);
			});

			it('200 when loading subpath root with trailing slash', async () => {
				const response = await fixture.fetch('/blog/');
				assert.equal(response.status, 200);
			});

			it('200 when loading subpath root without trailing slash', async () => {
				const response = await fixture.fetch('/blog');
				assert.equal(response.status, 200);
			});

			it('200 when loading another page with subpath used', async () => {
				const response = await fixture.fetch('/blog/another/');
				assert.equal(response.status, 200);
			});

			it('200 when loading another page with subpath not used', async () => {
				const response = await fixture.fetch('/blog/another');
				assert.equal(response.status, 200);
			});

			it('200 when loading dynamic route', async () => {
				const response = await fixture.fetch('/blog/1/');
				assert.equal(response.status, 200);
			});

			it('404 when loading invalid dynamic route', async () => {
				const response = await fixture.fetch('/blog/2/');
				assert.equal(response.status, 404);
			});
		});

		describe('Load custom 404.html', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;
			/** @type {import('./test-utils').PreviewServer} */
			let previewServer;

			let $;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/custom-404-html/',
					server: {
						port: 4003,
					},
				});
				await fixture.build();
				previewServer = await fixture.preview();
			});

			after(async () => {
				await previewServer.stop();
			});

			it('renders custom 404 for /a', async () => {
				const res = await fixture.fetch('/a');
				assert.equal(res.status, 404);

				const html = await res.text();
				$ = cheerio.load(html);

				assert.equal($('h1').text(), 'Page not found');
				assert.equal($('p').text(), 'This 404 is a static HTML file.');
			});
		});
	});

	describe('build format: file', () => {
		describe('Subpath without trailing slash and trailingSlash: never', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;
			/** @type {import('./test-utils').PreviewServer} */
			let previewServer;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/with-subpath-no-trailing-slash/',
					base: '/blog',
					outDir: './dist-4003',
					build: {
						format: 'file',
					},
					trailingSlash: 'never',
					server: {
						port: 4004,
					},
				});
				await fixture.build();
				previewServer = await fixture.preview();
			});

			after(async () => {
				await previewServer.stop();
			});

			it('404 when loading /', async () => {
				const response = await fixture.fetch('/');
				assert.equal(response.status, 404);
			});

			it('200 when loading subpath root with trailing slash', async () => {
				const response = await fixture.fetch('/blog/');
				assert.equal(response.status, 200);
				assert.equal(response.redirected, false);
			});

			it('200 when loading subpath root without trailing slash', async () => {
				const response = await fixture.fetch('/blog');
				assert.equal(response.status, 200);
				assert.equal(response.redirected, false);
			});

			it('404 when loading another page with subpath used', async () => {
				const response = await fixture.fetch('/blog/another/');
				assert.equal(response.status, 404);
			});

			it('200 when loading dynamic route', async () => {
				const response = await fixture.fetch('/blog/1');
				assert.equal(response.status, 200);
			});

			it('404 when loading invalid dynamic route', async () => {
				const response = await fixture.fetch('/blog/2');
				assert.equal(response.status, 404);
			});
		});

		describe('Subpath without trailing slash and trailingSlash: always', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;
			/** @type {import('./test-utils').PreviewServer} */
			let previewServer;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/with-subpath-no-trailing-slash/',
					base: '/blog',
					outDir: './dist-4004',
					build: {
						format: 'file',
					},
					trailingSlash: 'always',
					server: {
						port: 4005,
					},
				});
				await fixture.build();
				previewServer = await fixture.preview();
			});

			after(async () => {
				await previewServer.stop();
			});

			it('404 when loading /', async () => {
				const response = await fixture.fetch('/');
				assert.equal(response.status, 404);
			});

			it('200 when loading subpath root with trailing slash', async () => {
				const response = await fixture.fetch('/blog/');
				assert.equal(response.status, 200);
			});

			it('404 when loading subpath root without trailing slash', async () => {
				const response = await fixture.fetch('/blog');
				assert.equal(response.status, 404);
			});

			it('200 when loading another page with subpath used', async () => {
				const response = await fixture.fetch('/blog/another/');
				assert.equal(response.status, 200);
			});

			it('404 when loading another page with subpath not used', async () => {
				const response = await fixture.fetch('/blog/another');
				assert.equal(response.status, 404);
			});

			it('200 when loading dynamic route', async () => {
				const response = await fixture.fetch('/blog/1/');
				assert.equal(response.status, 200);
			});

			it('404 when loading invalid dynamic route', async () => {
				const response = await fixture.fetch('/blog/2/');
				assert.equal(response.status, 404);
			});
		});

		describe('Subpath without trailing slash and trailingSlash: ignore', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;
			/** @type {import('./test-utils').PreviewServer} */
			let previewServer;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/with-subpath-no-trailing-slash/',
					base: '/blog',
					outDir: './dist-4005',
					build: {
						format: 'file',
					},
					trailingSlash: 'ignore',
					server: {
						port: 4006,
					},
				});
				await fixture.build();
				previewServer = await fixture.preview();
			});

			after(async () => {
				await previewServer.stop();
			});

			it('404 when loading /', async () => {
				const response = await fixture.fetch('/');
				assert.equal(response.status, 404);
			});

			it('200 when loading subpath root with trailing slash', async () => {
				const response = await fixture.fetch('/blog/');
				assert.equal(response.status, 200);
			});

			it('200 when loading subpath root without trailing slash', async () => {
				const response = await fixture.fetch('/blog');
				assert.equal(response.status, 200);
			});

			it('200 when loading another page with subpath used', async () => {
				const response = await fixture.fetch('/blog/another/');
				assert.equal(response.status, 200);
			});

			it('200 when loading another page with subpath not used', async () => {
				const response = await fixture.fetch('/blog/another');
				assert.equal(response.status, 200);
			});

			it('200 when loading dynamic route', async () => {
				const response = await fixture.fetch('/blog/1/');
				assert.equal(response.status, 200);
			});

			it('404 when loading invalid dynamic route', async () => {
				const response = await fixture.fetch('/blog/2/');
				assert.equal(response.status, 404);
			});
		});

		describe('Exact file path', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;
			/** @type {import('./test-utils').PreviewServer} */
			let previewServer;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/with-subpath-no-trailing-slash/',
					base: '/blog',
					outDir: './dist-4006',
					build: {
						format: 'file',
					},
					trailingSlash: 'ignore',
					server: {
						port: 4007,
					},
				});
				await fixture.build();
				previewServer = await fixture.preview();
			});

			after(async () => {
				await previewServer.stop();
			});

			it('404 when loading /', async () => {
				const response = await fixture.fetch('/');
				assert.equal(response.status, 404);
			});

			it('200 when loading subpath with index.html', async () => {
				const response = await fixture.fetch('/blog/index.html');
				assert.equal(response.status, 200);
			});

			it('200 when loading another page with subpath used', async () => {
				const response = await fixture.fetch('/blog/another.html');
				assert.equal(response.status, 200);
			});

			it('200 when loading dynamic route', async () => {
				const response = await fixture.fetch('/blog/1.html');
				assert.equal(response.status, 200);
			});

			it('404 when loading invalid dynamic route', async () => {
				const response = await fixture.fetch('/blog/2.html');
				assert.equal(response.status, 404);
			});
		});

		describe('Load custom 404.html', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;
			/** @type {import('./test-utils').PreviewServer} */
			let previewServer;

			let $;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/custom-404-html/',
					build: {
						format: 'file',
					},
					server: {
						port: 4008,
					},
				});
				await fixture.build();
				previewServer = await fixture.preview();
			});

			after(async () => {
				await previewServer.stop();
			});

			it('renders custom 404 for /a', async () => {
				const res = await fixture.fetch('/a');
				assert.equal(res.status, 404);

				const html = await res.text();
				$ = cheerio.load(html);

				assert.equal($('h1').text(), 'Page not found');
				assert.equal($('p').text(), 'This 404 is a static HTML file.');
			});
		});
	});
});

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { ServerOnlyModule } from '../dist/core/errors/errors-data.js';
import { AstroError } from '../dist/core/errors/index.js';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('astro:config/client', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;

	describe('when the experimental flag is not enabled', async () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-manifest/',
				experimental: {
					serializeConfig: false,
				},
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('should throw an error when importing the module', async () => {
			const response = await fixture.fetch('/');
			const html = await response.text();
			assert.match(html, /CantUseAstroConfigModuleError/);
		});
	});

	describe('when the experimental flag is enabled in dev', async () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-manifest/',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('should return the expected properties', async () => {
			const response = await fixture.fetch('/');
			const html = await response.text();

			const $ = cheerio.load(html);

			assert.deepEqual(
				$('#config').text(),
				JSON.stringify({
					base: '/',
					i18n: {
						defaultLocale: 'en',
						locales: ['en', 'fr'],
						routing: {
							prefixDefaultLocale: false,
							redirectToDefaultLocale: true,
							fallbackType: 'redirect',
						},
					},
					build: {
						format: 'directory',
					},
					trailingSlash: 'ignore',
					compressHTML: true,
					site: 'https://astro.build/',
				}),
			);
		});
	});

	describe('when the experimental flag is enabled in build', async () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-manifest/',
			});
			await fixture.build();
		});

		it('should return the expected properties', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.deepEqual(
				$('#config').text(),
				JSON.stringify({
					base: '/',
					i18n: {
						defaultLocale: 'en',
						locales: ['en', 'fr'],
						routing: {
							prefixDefaultLocale: false,
							redirectToDefaultLocale: true,
							fallbackType: 'redirect',
						},
					},
					build: {
						format: 'directory',
					},
					trailingSlash: 'ignore',
					compressHTML: true,
					site: 'https://astro.build/',
				}),
			);
		});
	});
});

describe('astro:config/server', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;
	let app;

	describe('when build', () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-manifest-invalid/',
			});
		});

		it('should return an error when using inside a client script', async () => {
			const error = await fixture.build().catch((err) => err);
			assert.equal(error instanceof AstroError, true);
			assert.equal(error.name, ServerOnlyModule.name);
		});
	});

	describe('when the experimental flag is not enabled in dev', async () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-manifest/',
				experimental: {
					serializeConfig: false,
				},
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('should throw an error when importing the module', async () => {
			const response = await fixture.fetch('/server');
			const html = await response.text();
			assert.match(html, /CantUseAstroConfigModuleError/);
		});
	});

	describe('when the experimental flag is enabled in dev', async () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-manifest/',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('should return the expected properties', async () => {
			const response = await fixture.fetch('/server');
			const html = await response.text();

			const $ = cheerio.load(html);

			assert.ok($('#out-dir').text().endsWith('/dist/'));
			assert.ok($('#src-dir').text().endsWith('/src/'));
			assert.ok($('#cache-dir').text().endsWith('/.astro/'));
			assert.ok($('#root').text().endsWith('/'));
			assert.ok($('#build-client').text().endsWith('/dist/client/'));
			assert.ok($('#build-server').text().endsWith('/dist/server/'));
		});
	});

	describe('when the experimental flag is enabled in build', async () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-manifest/',
			});
			await fixture.build();
		});

		it('should return the expected properties', async () => {
			const html = await fixture.readFile('/server/index.html');
			const $ = cheerio.load(html);

			assert.ok($('#out-dir').text().endsWith('/dist/'));
			assert.ok($('#src-dir').text().endsWith('/src/'));
			assert.ok($('#cache-dir').text().endsWith('/.astro/'));
			assert.ok($('#root').text().endsWith('/'));
			assert.ok($('#build-client').text().endsWith('/dist/client/'));
			assert.ok($('#build-server').text().endsWith('/dist/server/'));
		});
	});

	describe('when the experimental flag is enabled in SSR', async () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-manifest/',
				adapter: testAdapter(),
				output: 'server',
			});

			await fixture.build();
			app = await fixture.loadTestAdapterApp();
		});

		it('should return the expected properties', async () => {
			const request = new Request('http://example.com/server');
			const response = await app.render(request);
			const html = await response.text();
			const $ = cheerio.load(html);

			assert.ok($('#out-dir').text().endsWith('/dist/'));
			assert.ok($('#src-dir').text().endsWith('/src/'));
			assert.ok($('#cache-dir').text().endsWith('/.astro/'));
			assert.ok($('#root').text().endsWith('/'));
			assert.ok($('#build-client').text().endsWith('/dist/client/'));
			assert.ok($('#build-server').text().endsWith('/dist/server/'));
		});
	});
});

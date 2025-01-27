import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { preact } from './fixtures/before-hydration/deps.mjs';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Astro Scripts before-hydration', () => {
	describe('SSG', () => {
		describe('Is used by an integration', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/before-hydration/',
					outDir: './dist/static-integration',
					integrations: [
						preact(),
						{
							name: '@test/before-hydration',
							hooks: {
								'astro:config:setup'({ injectScript }) {
									injectScript('before-hydration', `import '/src/scripts/global.js';`);
								},
							},
						},
					],
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

				it('Is included in the astro-island', async () => {
					let res = await fixture.fetch('/');
					let html = await res.text();
					let $ = cheerio.load(html);
					assert.equal($('astro-island[before-hydration-url]').length, 1);
				});
			});

			describe('Build', () => {
				before(async () => {
					await fixture.build();
				});

				it('Is included in the astro-island', async () => {
					let html = await fixture.readFile('/index.html');
					let $ = cheerio.load(html);
					assert.equal($('astro-island[before-hydration-url]').length, 1);
				});
			});
		});

		describe('Is not used by an integration', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/before-hydration/',
					outDir: './dist/static-no-integration',
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

				it('Does include before-hydration-url on the astro-island', async () => {
					let res = await fixture.fetch('/');
					let html = await res.text();
					let $ = cheerio.load(html);
					assert.equal($('astro-island[before-hydration-url]').length, 1);
				});
			});

			describe('Build', () => {
				before(async () => {
					await fixture.build();
				});

				it('Does not include before-hydration-url on the astro-island', async () => {
					let html = await fixture.readFile('/index.html');
					let $ = cheerio.load(html);
					assert.equal($('astro-island[before-hydration-url]').length, 0);
				});
			});
		});
	});

	describe('SSR', () => {
		describe('Is used by an integration', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/before-hydration/',
					output: 'server',
					adapter: testAdapter(),
					outDir: './dist/server-integration',
					integrations: [
						preact(),
						{
							name: '@test/before-hydration',
							hooks: {
								'astro:config:setup'({ injectScript }) {
									injectScript('before-hydration', `import '/src/scripts/global.js';`);
								},
							},
						},
					],
				});
			});

			describe('Prod', () => {
				before(async () => {
					await fixture.build();
				});

				it('Is included in the astro-island', async () => {
					let app = await fixture.loadTestAdapterApp();
					let request = new Request('http://example.com/');
					let response = await app.render(request);
					let html = await response.text();
					let $ = cheerio.load(html);
					assert.equal($('astro-island[before-hydration-url]').length, 1);
				});
			});
		});

		describe('Is not used by an integration', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/before-hydration/',
					output: 'server',
					outDir: './dist/static-no-integration',
					adapter: testAdapter(),
				});
			});

			describe('Build', () => {
				before(async () => {
					await fixture.build();
				});

				it('Does not include before-hydration-url on the astro-island', async () => {
					let app = await fixture.loadTestAdapterApp();
					let request = new Request('http://example.com/');
					let response = await app.render(request);
					let html = await response.text();
					let $ = cheerio.load(html);
					assert.equal($('astro-island[before-hydration-url]').length, 0);
				});
			});
		});
	});
});

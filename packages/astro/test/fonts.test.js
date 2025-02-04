// @ts-check
import { after, before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';
import assert from 'node:assert/strict';

describe('astro:fonts', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;
	/** @type {import('./test-utils.js').DevServer} */
	let devServer;

	describe('<Fonts /> component', () => {
		// TODO: remove once fonts are stabilized
		describe('Fonts are not enabled', () => {
			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/fonts/',
				});
				devServer = await fixture.startDevServer();
			});

			after(async () => {
				await devServer.stop();
			});

			it('Throws an error if fonts are not enabled', async () => {
				const res = await fixture.fetch('/');
				const body = await res.text();
				assert.equal(
					body.includes('<script type="module" src="/@vite/client">'),
					true,
					'Body does not include Vite error overlay script',
				);
			});
		});

		describe('Fonts are enabled', () => {
			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/fonts/',
					experimental: {
						fonts: {
							families: [
								{
									name: 'Roboto',
									provider: 'google',
								},
							],
						},
					},
				});
				devServer = await fixture.startDevServer();
			});

			after(async () => {
				await devServer.stop();
			});

			it('Includes styles', async () => {
				const res = await fixture.fetch('/');
				const body = await res.text();
				assert.equal(body.includes('<style>'), true);
			});

			it('Includes links when preloading', async () => {
				const res = await fixture.fetch('/preload');
				const body = await res.text();
				assert.equal(body.includes('<link rel="preload"'), true);
			});
		});
	});
});

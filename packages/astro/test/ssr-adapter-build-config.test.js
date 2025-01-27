import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { viteID } from '../dist/core/util.js';
import { loadFixture } from './test-utils.js';

describe('Integration buildConfig hook', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/ssr-request/',
			output: 'server',
			adapter: {
				name: 'my-ssr-adapter',
				hooks: {
					'astro:config:setup': ({ config, updateConfig }) => {
						updateConfig({
							build: {
								server: new URL('./dist/.root/server/', config.root),
								client: new URL('./dist/.root/client/', config.root),
							},
							vite: {
								plugins: [
									{
										resolveId(id) {
											if (id === '@my-ssr') {
												return id;
											} else if (id === 'astro/app') {
												const viteId = viteID(
													new URL('../dist/core/app/index.js', import.meta.url),
												);
												return viteId;
											}
										},
										load(id) {
											if (id === '@my-ssr') {
												return `import { App } from 'astro/app';export function createExports(manifest) { return { manifest, createApp: () => new App(manifest) }; }`;
											}
										},
									},
								],
							},
						});
					},
					'astro:config:done': ({ setAdapter }) => {
						setAdapter({
							name: 'my-ssr-adapter',
							serverEntrypoint: '@my-ssr',
							exports: ['manifest', 'createApp'],
							supportedAstroFeatures: {},
						});
					},
				},
			},
		});
		await fixture.build();
	});

	it('Puts client files in the client folder', async () => {
		let data = await fixture.readFile('/.root/client/cars.json');
		assert.notEqual(data, undefined);
	});

	it('Puts the server entry into the server folder', async () => {
		let data = await fixture.readFile('/.root/server/entry.mjs');
		assert.notEqual(data, undefined);
	});
});

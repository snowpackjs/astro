import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Static build: vite plugins included when required', () => {
	/** @type {Map<string, boolean>} */
	const pluginsCalled = new Map();
	/** @type {Map<string, boolean>} */
	const expectedPluginResult = new Map([
		['prepare-no-apply-plugin', true],
		['prepare-serve-plugin', false],
		['prepare-apply-fn-plugin', true],
		['prepare-dont-apply-fn-plugin', false],
		['prepare-build-plugin', true],
	]);
	before(async () => {
		/** @type {import('./test-utils').Fixture} */
		const fixture = await loadFixture({
			root: './fixtures/astro pages/',
			integrations: [
				{
					name: '@astrojs/prepare-vite-plugins',
					hooks: {
						'astro:config:setup': ({ updateConfig }) => {
							pluginsCalled.set('prepare-no-apply-plugin', false);
							pluginsCalled.set('prepare-serve-plugin', false);
							pluginsCalled.set('prepare-apply-fn-plugin', false);
							pluginsCalled.set('prepare-dont-apply-fn-plugin', false);
							pluginsCalled.set('prepare-build-plugin', false);
							updateConfig({
								vite: {
									plugins: [
										{
											name: 'prepare-no-apply-plugin',
											configResolved: () => {
												pluginsCalled.set('prepare-no-apply-plugin', true);
											},
										},
										{
											name: 'prepare-serve-plugin',
											apply: 'serve',
											configResolved: () => {
												pluginsCalled.set('prepare-serve-plugin', true);
											},
										},
										{
											name: 'prepare-apply-fn-plugin',
											apply: (_, { command }) => command === 'build',
											configResolved: () => {
												pluginsCalled.set('prepare-apply-fn-plugin', true);
											},
										},
										{
											name: 'prepare-dont-apply-fn-plugin',
											apply: (_, { command }) => command === 'serve',
											configResolved: () => {
												pluginsCalled.set('prepare-dont-apply-fn-plugin', true);
											},
										},
										{
											name: 'prepare-build-plugin',
											apply: 'build',
											configResolved: () => {
												pluginsCalled.set('prepare-build-plugin', true);
											},
										},
									],
								},
							});
						},
					},
				},
			],
		});
		await fixture.build();
	});
	it('Vite Plugins are included/excluded properly', async () => {
		assert.equal(pluginsCalled.size, expectedPluginResult.size, 'Not all plugins were initialized');
		Array.from(expectedPluginResult.entries()).forEach(([plugin, called]) =>
			assert.equal(
				pluginsCalled.get(plugin),
				called,
				`${plugin} was ${called ? 'not' : ''} called`,
			),
		);
	});
});

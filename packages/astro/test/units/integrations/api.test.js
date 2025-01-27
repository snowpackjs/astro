import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateSupportedFeatures } from '../../../dist/integrations/features-validation.js';
import {
	normalizeCodegenDir,
	normalizeInjectedTypeFilename,
	runHookBuildSetup,
	runHookConfigSetup,
} from '../../../dist/integrations/hooks.js';
import { createFixture, defaultLogger, runInContainer } from '../test-utils.js';

const defaultConfig = {
	root: new URL('./', import.meta.url),
	srcDir: new URL('src/', import.meta.url),
};
const dotAstroDir = new URL('./.astro/', defaultConfig.root);

describe('Integration API', () => {
	it('runHookBuildSetup should work', async () => {
		const updatedViteConfig = await runHookBuildSetup({
			config: {
				...defaultConfig,
				integrations: [
					{
						name: 'test',
						hooks: {
							'astro:build:setup'({ updateConfig }) {
								updateConfig({
									define: {
										foo: 'bar',
									},
								});
							},
						},
					},
				],
			},
			vite: {},
			logger: defaultLogger,
			pages: new Map(),
			target: 'server',
		});
		assert.equal(updatedViteConfig.hasOwnProperty('define'), true);
	});

	it('runHookBuildSetup should return updated config', async () => {
		let updatedInternalConfig;
		const updatedViteConfig = await runHookBuildSetup({
			config: {
				...defaultConfig,
				integrations: [
					{
						name: 'test',
						hooks: {
							'astro:build:setup'({ updateConfig }) {
								updatedInternalConfig = updateConfig({
									define: {
										foo: 'bar',
									},
								});
							},
						},
					},
				],
			},
			vite: {},
			logger: defaultLogger,
			pages: new Map(),
			target: 'server',
		});
		assert.deepEqual(updatedViteConfig, updatedInternalConfig);
	});

	it('runHookConfigSetup can update Astro config', async () => {
		const site = 'https://test.com/';
		const updatedSettings = await runHookConfigSetup({
			logger: defaultLogger,
			settings: {
				config: {
					...defaultConfig,
					integrations: [
						{
							name: 'test',
							hooks: {
								'astro:config:setup': ({ updateConfig }) => {
									updateConfig({ site });
								},
							},
						},
					],
				},
				dotAstroDir,
			},
		});
		assert.equal(updatedSettings.config.site, site);
	});

	it('runHookConfigSetup runs integrations added by another integration', async () => {
		const site = 'https://test.com/';
		const updatedSettings = await runHookConfigSetup({
			logger: defaultLogger,
			settings: {
				config: {
					...defaultConfig,
					integrations: [
						{
							name: 'test',
							hooks: {
								'astro:config:setup': ({ updateConfig }) => {
									updateConfig({
										integrations: [
											{
												name: 'dynamically-added',
												hooks: {
													// eslint-disable-next-line @typescript-eslint/no-shadow
													'astro:config:setup': ({ updateConfig }) => {
														updateConfig({ site });
													},
												},
											},
										],
									});
								},
							},
						},
					],
				},
				dotAstroDir,
			},
		});
		assert.equal(updatedSettings.config.site, site);
		assert.equal(updatedSettings.config.integrations.length, 2);
	});

	describe('Routes resolved hooks', () => {
		it('should work in dev', async () => {
			let routes = [];
			const fixture = await createFixture({
				'/src/pages/about.astro': '',
				'/src/actions.ts': 'export const server = {}',
				'/src/foo.astro': '',
			});

			await runInContainer(
				{
					inlineConfig: {
						root: fixture.path,
						integrations: [
							{
								name: 'test',
								hooks: {
									'astro:config:setup': (params) => {
										params.injectRoute({
											entrypoint: './src/foo.astro',
											pattern: '/foo',
										});
									},
									'astro:routes:resolved': (params) => {
										routes = params.routes.map((r) => ({
											isPrerendered: r.isPrerendered,
											entrypoint: r.entrypoint,
											pattern: r.pattern,
											params: r.params,
											origin: r.origin,
										}));
										routes.sort((a, b) => a.pattern.localeCompare(b.pattern));
									},
								},
							},
						],
					},
				},
				async (container) => {
					assert.deepEqual(
						routes,
						[
							{
								isPrerendered: false,
								entrypoint: '_server-islands.astro',
								pattern: '/_server-islands/[name]',
								params: ['name'],
								origin: 'internal',
							},
							{
								isPrerendered: false,
								entrypoint: '../../../../dist/actions/runtime/route.js',
								pattern: '/_actions/[...path]',
								params: ['...path'],
								origin: 'internal',
							},
							{
								isPrerendered: true,
								entrypoint: 'src/pages/about.astro',
								pattern: '/about',
								params: [],
								origin: 'project',
							},
							{
								isPrerendered: true,
								entrypoint: 'src/foo.astro',
								pattern: '/foo',
								params: [],
								origin: 'external',
							},
							{
								isPrerendered: false,
								entrypoint: '../../../../dist/assets/endpoint/node.js',
								pattern: '/_image',
								params: [],
								origin: 'internal',
							},
							{
								isPrerendered: false,
								entrypoint: 'astro-default-404.astro',
								pattern: '/404',
								params: [],
								origin: 'internal',
							},
						].sort((a, b) => a.pattern.localeCompare(b.pattern)),
					);

					await fixture.writeFile('/src/pages/bar.astro', '');
					container.viteServer.watcher.emit(
						'add',
						fixture.getPath('/src/pages/bar.astro').replace(/\\/g, '/'),
					);
					await new Promise((r) => setTimeout(r, 100));

					assert.deepEqual(
						routes,
						[
							{
								isPrerendered: false,
								entrypoint: '_server-islands.astro',
								pattern: '/_server-islands/[name]',
								params: ['name'],
								origin: 'internal',
							},
							{
								isPrerendered: false,
								entrypoint: '../../../../dist/actions/runtime/route.js',
								pattern: '/_actions/[...path]',
								params: ['...path'],
								origin: 'internal',
							},
							{
								isPrerendered: true,
								entrypoint: 'src/pages/about.astro',
								pattern: '/about',
								params: [],
								origin: 'project',
							},
							{
								isPrerendered: true,
								entrypoint: 'src/pages/bar.astro',
								pattern: '/bar',
								params: [],
								origin: 'project',
							},
							{
								isPrerendered: true,
								entrypoint: 'src/foo.astro',
								pattern: '/foo',
								params: [],
								origin: 'external',
							},
							{
								isPrerendered: false,
								entrypoint: '../../../../dist/assets/endpoint/node.js',
								pattern: '/_image',
								params: [],
								origin: 'internal',
							},
							{
								isPrerendered: false,
								entrypoint: 'astro-default-404.astro',
								pattern: '/404',
								params: [],
								origin: 'internal',
							},
						].sort((a, b) => a.pattern.localeCompare(b.pattern)),
					);

					await fixture.writeFile('/src/pages/about.astro', '---\nexport const prerender=false\n');
					container.viteServer.watcher.emit(
						'change',
						fixture.getPath('/src/pages/about.astro').replace(/\\/g, '/'),
					);
					await new Promise((r) => setTimeout(r, 100));

					assert.deepEqual(
						routes,
						[
							{
								isPrerendered: false,
								entrypoint: '_server-islands.astro',
								pattern: '/_server-islands/[name]',
								params: ['name'],
								origin: 'internal',
							},
							{
								isPrerendered: false,
								entrypoint: '../../../../dist/actions/runtime/route.js',
								pattern: '/_actions/[...path]',
								params: ['...path'],
								origin: 'internal',
							},
							{
								isPrerendered: false,
								entrypoint: 'src/pages/about.astro',
								pattern: '/about',
								params: [],
								origin: 'project',
							},
							{
								isPrerendered: true,
								entrypoint: 'src/pages/bar.astro',
								pattern: '/bar',
								params: [],
								origin: 'project',
							},
							{
								isPrerendered: true,
								entrypoint: 'src/foo.astro',
								pattern: '/foo',
								params: [],
								origin: 'external',
							},
							{
								isPrerendered: false,
								entrypoint: '../../../../dist/assets/endpoint/node.js',
								pattern: '/_image',
								params: [],
								origin: 'internal',
							},
							{
								isPrerendered: false,
								entrypoint: 'astro-default-404.astro',
								pattern: '/404',
								params: [],
								origin: 'internal',
							},
						].sort((a, b) => a.pattern.localeCompare(b.pattern)),
					);
				},
			);
		});
	});

	describe('Routes setup hook', () => {
		it('should work in dev', async () => {
			let routes = [];
			const fixture = await createFixture({
				'/src/pages/no-prerender.astro': '---\nexport const prerender = false\n---',
				'/src/pages/prerender.astro': '---\nexport const prerender = true\n---',
				'/src/pages/unknown-prerender.astro': '',
			});

			await runInContainer(
				{
					inlineConfig: {
						root: fixture.path,
						integrations: [
							{
								name: 'test',
								hooks: {
									'astro:route:setup': (params) => {
										routes.push({
											component: params.route.component,
											prerender: params.route.prerender,
										});
									},
								},
							},
						],
					},
				},
				async () => {
					routes.sort((a, b) => a.component.localeCompare(b.component));
					assert.deepEqual(routes, [
						{
							component: 'src/pages/no-prerender.astro',
							prerender: false,
						},
						{
							component: 'src/pages/prerender.astro',
							prerender: true,
						},
						{
							component: 'src/pages/unknown-prerender.astro',
							prerender: true,
						},
					]);
				},
			);
		});
	});
});

describe('Astro feature map', function () {
	it('should support the feature when stable', () => {
		let result = validateSupportedFeatures(
			'test',
			{
				hybridOutput: 'stable',
			},
			{
				config: { output: 'static' },
			},
			{},
			defaultLogger,
		);
		assert.equal(result['hybridOutput'], true);
	});

	it('should not support the feature when not provided', () => {
		let result = validateSupportedFeatures(
			'test',
			{},
			{
				buildOutput: 'server',
				config: { output: 'static' },
			},
			defaultLogger,
		);
		assert.equal(result['hybridOutput'], false);
	});

	it('should not support the feature when an empty object is provided', () => {
		let result = validateSupportedFeatures(
			'test',
			{},
			{
				buildOutput: 'server',
				config: { output: 'static' },
			},
			defaultLogger,
		);
		assert.equal(result['hybridOutput'], false);
	});

	describe('static output', function () {
		it('should be supported with the correct config', () => {
			let result = validateSupportedFeatures(
				'test',
				{ staticOutput: 'stable' },
				{
					config: { output: 'static' },
				},
				defaultLogger,
			);
			assert.equal(result['staticOutput'], true);
		});

		it("should not be valid if the config is correct, but the it's unsupported", () => {
			let result = validateSupportedFeatures(
				'test',
				{ staticOutput: 'unsupported' },
				{
					buildOutput: 'static',
					config: { output: 'static' },
				},
				defaultLogger,
			);
			assert.equal(result['staticOutput'], false);
		});
	});
	describe('hybrid output', function () {
		it('should be supported with the correct config', () => {
			let result = validateSupportedFeatures(
				'test',
				{ hybridOutput: 'stable' },
				{
					config: { output: 'static' },
				},
				defaultLogger,
			);
			assert.equal(result['hybridOutput'], true);
		});

		it("should not be valid if the config is correct, but the it's unsupported", () => {
			let result = validateSupportedFeatures(
				'test',
				{
					hybridOutput: 'unsupported',
				},
				{
					buildOutput: 'server',
					config: { output: 'static' },
				},
				defaultLogger,
			);
			assert.equal(result['hybridOutput'], false);
		});
	});
	describe('server output', function () {
		it('should be supported with the correct config', () => {
			let result = validateSupportedFeatures(
				'test',
				{ serverOutput: 'stable' },
				{
					config: { output: 'server' },
				},
				defaultLogger,
			);
			assert.equal(result['serverOutput'], true);
		});

		it("should not be valid if the config is correct, but the it's unsupported", () => {
			let result = validateSupportedFeatures(
				'test',
				{
					serverOutput: 'unsupported',
				},
				{
					config: { output: 'server' },
				},
				defaultLogger,
			);
			assert.equal(result['serverOutput'], false);
		});
	});
});

describe('normalizeInjectedTypeFilename', () => {
	// invalid filename
	assert.throws(() => normalizeInjectedTypeFilename('types', 'integration'));
	// valid filename
	assert.doesNotThrow(() => normalizeInjectedTypeFilename('types.d.ts', 'integration'));
	// filename normalization
	assert.equal(
		normalizeInjectedTypeFilename('aA1-*/_"~.d.ts', 'integration'),
		'./integrations/integration/aA1-_____.d.ts',
	);
	// integration name normalization
	assert.equal(
		normalizeInjectedTypeFilename('types.d.ts', 'aA1-*/_"~.'),
		'./integrations/aA1-_____./types.d.ts',
	);
});

describe('normalizeCodegenDir', () => {
	assert.equal(normalizeCodegenDir('aA1-*/_"~.'), './integrations/aA1-_____./');
});

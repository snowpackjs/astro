import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Logger } from '../../../dist/core/logger/core.js';
import { createRouteManifest } from '../../../dist/core/routing/manifest/create.js';
import { createBasicSettings, createFs } from '../test-utils.js';

const root = new URL('../../fixtures/alias/', import.meta.url);

function getManifestRoutes(manifest, includeRedirect = false) {
	return manifest.routes.map((route) => ({
		type: route.type,
		route: route.route,
		...(includeRedirect ? { redirectRoute: route.redirectRoute } : {}),
	}));
}

function getLogger() {
	const logs = [];

	return {
		logger: new Logger({
			dest: { write: (msg) => logs.push(msg) },
			level: 'debug',
		}),
		logs,
	};
}

function assertRouteRelations(routes, relations) {
	const routePaths = routes.map((route) => route.route);

	for (const [before, after] of relations) {
		const beforeIndex = routePaths.indexOf(before);
		const afterIndex = routePaths.indexOf(after);

		if (beforeIndex > afterIndex) {
			assert.fail(`${before} should be higher priority than ${after}`);
		}
	}
}

describe('routing - createRouteManifest', () => {
	it('using trailingSlash: "never" does not match the index route when it contains a trailing slash', async () => {
		const fs = createFs(
			{
				'/src/pages/index.astro': `<h1>test</h1>`,
			},
			root
		);
		const settings = await createBasicSettings({
			root: fileURLToPath(root),
			base: '/search',
			trailingSlash: 'never',
		});
		const manifest = createRouteManifest({
			cwd: fileURLToPath(root),
			settings,
			fsMod: fs,
		});
		const [{ pattern }] = manifest.routes;
		assert.equal(pattern.test(''), true);
		assert.equal(pattern.test('/'), false);
	});

	it('endpoint routes are sorted before page routes', async () => {
		const fs = createFs(
			{
				'/src/pages/[contact].astro': `<h1>test</h1>`,
				'/src/pages/[contact].ts': `<h1>test</h1>`,
			},
			root
		);
		const settings = await createBasicSettings({
			root: fileURLToPath(root),
			base: '/search',
			trailingSlash: 'never',
			experimental: {
				globalRoutePriority: true,
			},
		});

		settings.injectedRoutes = [
			{
				pattern: '/about',
				entrypoint: '@lib/legacy/static.astro',
			},
			{
				pattern: '/api',
				entrypoint: '@lib/legacy/static.ts',
			},
		];

		const manifest = createRouteManifest({
			cwd: fileURLToPath(root),
			settings,
			fsMod: fs,
		});

		assert.deepEqual(getManifestRoutes(manifest), [
			{
				route: '/about',
				type: 'page',
			},
			{
				route: '/api',
				type: 'endpoint',
			},
			{
				route: '/[contact]',
				type: 'endpoint',
			},
			{
				route: '/[contact]',
				type: 'page',
			},
		]);
	});

	it('static routes are sorted before dynamic and rest routes', async () => {
		const fs = createFs(
			{
				'/src/pages/[dynamic].astro': `<h1>test</h1>`,
				'/src/pages/[...rest].astro': `<h1>test</h1>`,
				'/src/pages/static.astro': `<h1>test</h1>`,
				'/src/pages/static-[dynamic].astro': `<h1>test</h1>`,
				'/src/pages/index.astro': `<h1>test</h1>`,
			},
			root
		);
		const settings = await createBasicSettings({
			root: fileURLToPath(root),
			base: '/search',
			trailingSlash: 'never',
			experimental: {
				globalRoutePriority: true,
			},
		});

		const manifest = createRouteManifest({
			cwd: fileURLToPath(root),
			settings,
			fsMod: fs,
		});

		assertRouteRelations(getManifestRoutes(manifest), [
			['/', '/[...rest]'],
			['/static', '/static-[dynamic]'],
			['/static-[dynamic]', '/[dynamic]'],
			['/static', '/[dynamic]'],
			['/static', '/[...rest]'],
			['/[dynamic]', '/[...rest]'],
		]);
	});

	it('route sorting with multi-layer index page conflict', async () => {
		// Reproducing regression from https://github.com/withastro/astro/issues/10071
		const fs = createFs(
			{
				'/src/pages/a/1.astro': `<h1>test</h1>`,
				'/src/pages/a/2.astro': `<h1>test</h1>`,
				'/src/pages/a/3.astro': `<h1>test</h1>`,
				'/src/pages/modules/[...slug].astro': `<h1>test</h1>`,
				'/src/pages/modules/index.astro': `<h1>test</h1>`,
				'/src/pages/test/[...slug].astro': `<h1>test</h1>`,
				'/src/pages/test/index.astro': `<h1>test</h1>`,
				'/src/pages/index.astro': `<h1>test</h1>`,
			},
			root
		);
		const settings = await createBasicSettings({
			root: fileURLToPath(root),
			base: '/search',
			trailingSlash: 'never',
			experimental: {
				globalRoutePriority: true,
			},
		});

		const manifest = createRouteManifest({
			cwd: fileURLToPath(root),
			settings,
			fsMod: fs,
		});

		assertRouteRelations(getManifestRoutes(manifest), [
			// Parent route should come before rest parameters
			['/test', '/test/[...slug]'],
			['/modules', '/modules/[...slug]'],

			// More specific routes should come before less specific routes
			['/a/1', '/'],
			['/a/2', '/'],
			['/a/3', '/'],
			['/test', '/'],
			['/modules', '/'],

			// Alphabetical order
			['/modules', '/test'],
		]);
	});

	it('route sorting respects the file tree', async () => {
		const fs = createFs(
			{
				'/src/pages/[dynamic_folder]/static.astro': `<h1>test</h1>`,
				'/src/pages/[dynamic_folder]/index.astro': `<h1>test</h1>`,
				'/src/pages/[dynamic_folder]/[...rest].astro': `<h1>test</h1>`,
				'/src/pages/[...rest]/static.astro': `<h1>test</h1>`,
				'/src/pages/[...rest]/index.astro': `<h1>test</h1>`,
				'/src/pages/blog/index.astro': `<h1>test</h1>`,
				'/src/pages/blog/[...slug].astro': `<h1>test</h1>`,
				'/src/pages/[dynamic_file].astro': `<h1>test</h1>`,
				'/src/pages/[...other].astro': `<h1>test</h1>`,
				'/src/pages/static.astro': `<h1>test</h1>`,
				'/src/pages/index.astro': `<h1>test</h1>`,
			},
			root
		);
		const settings = await createBasicSettings({
			root: fileURLToPath(root),
			base: '/search',
			trailingSlash: 'never',
			experimental: {
				globalRoutePriority: true,
			},
		});

		const manifest = createRouteManifest({
			cwd: fileURLToPath(root),
			settings,
			fsMod: fs,
		});

		assertRouteRelations(getManifestRoutes(manifest), [
			// Parent route should come before rest parameters
			['/', '/[...rest]'],
			['/', '/[...other]'],
			['/blog', '/blog/[...slug]'],
			['/[dynamic_file]', '/[dynamic_folder]/[...rest]'],
			['/[dynamic_folder]', '/[dynamic_folder]/[...rest]'],

			// Static should come before dynamic
			['/static', '/[dynamic_folder]'],
			['/static', '/[dynamic_file]'],

			// Static should come before rest parameters
			['/blog', '/[...rest]'],
			['/blog', '/[...other]'],
			['/static', '/[...rest]'],
			['/static', '/[...other]'],
			['/static', '/[...rest]/static'],
			['/[dynamic_folder]/static', '/[dynamic_folder]/[...rest]'],

			// Dynamic should come before rest parameters
			['/[dynamic_file]', '/[dynamic_folder]/[...rest]'],

			// More specific routes should come before less specific routes
			['/[dynamic_folder]/[...rest]', '/[...rest]'],
			['/[dynamic_folder]/[...rest]', '/[...other]'],
			['/blog/[...slug]', '/[...rest]'],
			['/blog/[...slug]', '/[...other]'],
		]);
	});

	it('injected routes are sorted in legacy mode above filesystem routes', async () => {
		const fs = createFs(
			{
				'/src/pages/index.astro': `<h1>test</h1>`,
				'/src/pages/blog/[...slug].astro': `<h1>test</h1>`,
			},
			root
		);
		const settings = await createBasicSettings({
			root: fileURLToPath(root),
			output: 'server',
			base: '/search',
			trailingSlash: 'never',
		});

		settings.injectedRoutes = [
			{
				pattern: '/contributing',
				entrypoint: '@lib/legacy/static.astro',
			},
			{
				pattern: '/[...slug]',
				entrypoint: '@lib/legacy/dynamic.astro',
			},
		];

		const manifest = createRouteManifest({
			cwd: fileURLToPath(root),
			settings,
			fsMod: fs,
		});

		assert.deepEqual(getManifestRoutes(manifest), [
			{
				route: '/contributing',
				type: 'page',
			},
			{
				route: '/[...slug]',
				type: 'page',
			},
			{
				route: '/blog/[...slug]',
				type: 'page',
			},
			{
				route: '/',
				type: 'page',
			},
		]);
	});

	it('injected routes are sorted alongside filesystem routes', async () => {
		const fs = createFs(
			{
				'/src/pages/index.astro': `<h1>test</h1>`,
				'/src/pages/blog/[...slug].astro': `<h1>test</h1>`,
			},
			root
		);
		const settings = await createBasicSettings({
			root: fileURLToPath(root),
			output: 'server',
			base: '/search',
			trailingSlash: 'never',
			experimental: {
				globalRoutePriority: true,
			},
		});

		settings.injectedRoutes = [
			{
				pattern: '/contributing',
				entrypoint: '@lib/legacy/static.astro',
			},
			{
				pattern: '/[...slug]',
				entrypoint: '@lib/legacy/dynamic.astro',
				priority: 'normal',
			},
		];

		const manifest = createRouteManifest({
			cwd: fileURLToPath(root),
			settings,
			fsMod: fs,
		});

		assert.deepEqual(getManifestRoutes(manifest), [
			{
				route: '/blog/[...slug]',
				type: 'page',
			},
			{
				route: '/contributing',
				type: 'page',
			},
			{
				route: '/',
				type: 'page',
			},
			{
				route: '/[...slug]',
				type: 'page',
			},
		]);
	});

	it('redirects are sorted in legacy mode below the filesystem routes', async () => {
		const fs = createFs(
			{
				'/src/pages/index.astro': `<h1>test</h1>`,
				'/src/pages/blog/contributing.astro': `<h1>test</h1>`,
			},
			root
		);
		const settings = await createBasicSettings({
			root: fileURLToPath(root),
			output: 'server',
			base: '/search',
			trailingSlash: 'never',
			redirects: {
				'/blog/[...slug]': '/',
				'/blog/about': {
					status: 302,
					destination: '/another',
				},
			},
		});
		const manifest = createRouteManifest({
			cwd: fileURLToPath(root),
			settings,
			fsMod: fs,
		});

		assert.deepEqual(getManifestRoutes(manifest), [
			{
				route: '/blog/contributing',
				type: 'page',
			},
			{
				route: '/',
				type: 'page',
			},
			{
				route: '/blog/about',
				type: 'redirect',
			},
			{
				route: '/blog/[...slug]',
				type: 'redirect',
			},
		]);
	});

	it('redirects are sorted alongside the filesystem routes', async () => {
		const fs = createFs(
			{
				'/src/pages/index.astro': `<h1>test</h1>`,
				'/src/pages/blog/contributing.astro': `<h1>test</h1>`,
			},
			root
		);
		const settings = await createBasicSettings({
			root: fileURLToPath(root),
			output: 'server',
			base: '/search',
			trailingSlash: 'never',
			redirects: {
				'/blog/[...slug]': {
					status: 302,
					destination: '/',
				},
				'/blog/about': {
					status: 302,
					destination: '/another',
				},
			},
			experimental: {
				globalRoutePriority: true,
			},
		});
		const manifest = createRouteManifest({
			cwd: fileURLToPath(root),
			settings,
			fsMod: fs,
		});

		assert.deepEqual(getManifestRoutes(manifest), [
			{
				route: '/blog/about',
				type: 'redirect',
			},
			{
				route: '/blog/contributing',
				type: 'page',
			},
			{
				route: '/blog/[...slug]',
				type: 'redirect',
			},
			{
				route: '/',
				type: 'page',
			},
		]);
	});

	it('redirect routes are correctly resolved', async () => {
		const fs = createFs(
			{
				'/src/pages/[category]/page/[page].astro': `<h1>test</h1>`,
				'/src/pages/[category]/[...slug].astro': `<h1>test</h1>`,
			},
			root
		);

		const settings = await createBasicSettings({
			root: fileURLToPath(root),
			output: 'server',
			base: '/blog',
			trailingSlash: 'never',
			redirects: {
				'/[category]': '/[category]/page/1',
				'/[category]/old-pages/[page]': '/[category]/page/[page]',
			},
			integrations: [],
			experimental: {
				globalRoutePriority: true,
			},
		});

		const manifest = createRouteManifest({
			cwd: fileURLToPath(root),
			settings,
			fsMod: fs,
		});

		const targetRoute = manifest.routes.find((route) => route.route === '/[category]/page/[page]');

		assert.deepEqual(getManifestRoutes(manifest, true), [
			{
				route: '/[category]/old-pages/[page]',
				type: 'redirect',
				redirectRoute: targetRoute,
			},
			{
				route: '/[category]/page/[page]',
				type: 'page',
				redirectRoute: undefined,
			},
			{
				route: '/[category]',
				type: 'redirect',
				redirectRoute: targetRoute,
			},
			{
				route: '/[category]/[...slug]',
				type: 'page',
				redirectRoute: undefined,
			},
		]);
	});

	it('redirect routes target params should exist in old route', async () => {
		const fs = createFs(
			{
				'/src/pages/[category]/page/[page].astro': `<h1>test</h1>`,
				'/src/pages/[category]/[...slug].astro': `<h1>test</h1>`,
			},
			root
		);
		async function createWithRedirect(redirects) {
			const settings = await createBasicSettings({
				root: fileURLToPath(root),
				output: 'server',
				base: '/blog',
				trailingSlash: 'never',
				redirects,
				integrations: [],
				experimental: {
					globalRoutePriority: true,
				},
			});
			return createRouteManifest({
				cwd: fileURLToPath(root),
				settings,
				fsMod: fs,
			});
		}

		await assert.rejects(
			async () =>
				await createWithRedirect({
					'/[category]': '/[category]/page/[page]',
				}),
			(err) => {
				assert.match(err.message, /Parameter \[page\] must also be present in the old route/);
				return true;
			}
		);

		await assert.rejects(
			async () =>
				await createWithRedirect({
					'/[category]': '/[category]/page/[...slug]',
				}),
			(err) => {
				assert.match(err.message, /Parameter \[\.{3}slug\] must also be present in the old route/);
				return true;
			}
		);

		const omitDynamicManifest = await createWithRedirect({
			'/[category]/old/[omit]': '/[category]/page/1',
		});

		assert.deepEqual(getManifestRoutes(omitDynamicManifest, true), [
			{
				route: '/[category]/old/[omit]',
				type: 'redirect',
				redirectRoute: omitDynamicManifest.routes.find(
					(route) => route.route === '/[category]/page/[page]'
				),
			},
			{
				redirectRoute: undefined,
				route: '/[category]/page/[page]',
				type: 'page',
			},
			{
				redirectRoute: undefined,
				route: '/[category]/[...slug]',
				type: 'page',
			},
		]);

		const omitSlug = await createWithRedirect({
			'/[category]/old/[...omit]': '/[category]/page/1',
		});

		assert.deepEqual(getManifestRoutes(omitSlug, true), [
			{
				route: '/[category]/old/[...omit]',
				type: 'redirect',
				redirectRoute: omitSlug.routes.find((route) => route.route === '/[category]/page/[page]'),
			},
			{
				redirectRoute: undefined,
				route: '/[category]/page/[page]',
				type: 'page',
			},
			{
				redirectRoute: undefined,
				route: '/[category]/[...slug]',
				type: 'page',
			},
		]);
	});

	it('report colliding static routes', async () => {
		const fs = createFs(
			{
				'/src/pages/contributing.astro': `<h1>test</h1>`,
			},
			root
		);
		const settings = await createBasicSettings({
			root: fileURLToPath(root),
			output: 'server',
			base: '/search',
			trailingSlash: 'never',
			integrations: [],
			experimental: {
				globalRoutePriority: true,
			},
		});

		settings.injectedRoutes = [
			{
				pattern: '/contributing',
				entrypoint: '@lib/legacy/static.astro',
			},
		];

		const manifestOptions = {
			cwd: fileURLToPath(root),
			settings,
			fsMod: fs,
		};

		const { logger, logs } = getLogger();

		createRouteManifest(manifestOptions, logger);

		assert.deepEqual(logs, [
			{
				label: 'router',
				level: 'warn',
				message:
					'The route "/contributing" is defined in both "src/pages/contributing.astro" and "@lib/legacy/static.astro". A static route cannot be defined more than once.',
				newLine: true,
			},
			{
				label: 'router',
				level: 'warn',
				message: 'A collision will result in an hard error in following versions of Astro.',
				newLine: true,
			},
		]);
	});

	it('report colliding SSR dynamic routes', async () => {
		const fs = createFs(
			{
				'/src/pages/[foo].astro': `<h1>test</h1>`,
				'/src/pages/[bar].astro': `<h1>test</h1>`,
			},
			root
		);
		const settings = await createBasicSettings({
			root: fileURLToPath(root),
			output: 'server',
			base: '/search',
			trailingSlash: 'never',
			integrations: [],
			experimental: {
				globalRoutePriority: true,
			},
		});

		const manifestOptions = {
			cwd: fileURLToPath(root),
			settings,
			fsMod: fs,
		};

		const { logger, logs } = getLogger();

		createRouteManifest(manifestOptions, logger);

		assert.deepEqual(logs, [
			{
				label: 'router',
				level: 'warn',
				message:
					'The route "/[bar]" is defined in both "src/pages/[bar].astro" and "src/pages/[foo].astro" using SSR mode. A dynamic SSR route cannot be defined more than once.',
				newLine: true,
			},
			{
				label: 'router',
				level: 'warn',
				message: 'A collision will result in an hard error in following versions of Astro.',
				newLine: true,
			},
		]);
	});

	it('should concatenate each part of the segment. issues#10122', async () => {
		const fs = createFs(
			{
				'/src/pages/a-[b].astro': `<h1>test</h1>`,
				'/src/pages/blog/a-[b].233.ts': ``,
			},
			root
		);

		const settings = await createBasicSettings({
			root: fileURLToPath(root),
			output: 'server',
			base: '/search',
			trailingSlash: 'never',
			redirects: {
				'/posts/a-[b].233': '/blog/a-[b].233',
			},
			experimental: {
				globalRoutePriority: true,
			},
		});

		settings.injectedRoutes = [
			{
				pattern: '/[c]-d',
				entrypoint: '@lib/legacy/dynamic.astro',
				priority: 'normal',
			},
		];

		const manifest = createRouteManifest({
			cwd: fileURLToPath(root),
			settings,
			fsMod: fs,
		});

		assert.deepEqual(getManifestRoutes(manifest), [
			{ type: 'endpoint', route: '/blog/a-[b].233' },
			{ type: 'redirect', route: '/posts/a-[b].233' },
			{ type: 'page', route: '/[c]-d' },
			{ type: 'page', route: '/a-[b]' },
		]);
	});
});

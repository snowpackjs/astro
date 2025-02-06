import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Logger } from '../../../dist/core/logger/core.js';
import { createRoutesList } from '../../../dist/core/routing/index.js';
import { createBasicSettings, createFixture } from '../test-utils.js';

function getManifestRoutes(manifest) {
	return manifest.routes.map((route) => ({
		type: route.type,
		route: route.route,
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

describe('routing - createRoutesList', () => {
	it('using trailingSlash: "never" does not match the index route when it contains a trailing slash', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': `<h1>test</h1>`,
		});
		const settings = await createBasicSettings({
			root: fixture.path,
			base: '/search',
			trailingSlash: 'never',
		});
		const manifest = await createRoutesList({
			cwd: fixture.path,
			settings,
		});
		const [{ pattern }] = manifest.routes;
		assert.equal(pattern.test(''), true);
		assert.equal(pattern.test('/'), false);
	});

	it('endpoint routes are sorted before page routes', async () => {
		const fixture = await createFixture({
			'/src/pages/[contact].astro': `<h1>test</h1>`,
			'/src/pages/[contact].ts': `<h1>test</h1>`,
			'/src/entrypoint.astro': `<h1>test</h1>`,
			'/src/entrypoint.ts': `<h1>test</h1>`,
		});
		const settings = await createBasicSettings({
			root: fixture.path,
			base: '/search',
			trailingSlash: 'never',
		});

		settings.injectedRoutes = [
			{
				pattern: '/about',
				entrypoint: 'src/entrypoint.astro',
			},
			{
				pattern: '/api',
				entrypoint: 'src/entrypoint.ts',
			},
		];

		const manifest = await createRoutesList({
			cwd: fixture.path,
			settings,
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
		const fixture = await createFixture({
			'/src/pages/[dynamic].astro': `<h1>test</h1>`,
			'/src/pages/[...rest].astro': `<h1>test</h1>`,
			'/src/pages/static.astro': `<h1>test</h1>`,
			'/src/pages/static-[dynamic].astro': `<h1>test</h1>`,
			'/src/pages/index.astro': `<h1>test</h1>`,
		});
		const settings = await createBasicSettings({
			root: fixture.path,
			base: '/search',
			trailingSlash: 'never',
		});

		const manifest = await createRoutesList({
			cwd: fixture.path,
			settings,
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
		const fixture = await createFixture({
			'/src/pages/a/1.astro': `<h1>test</h1>`,
			'/src/pages/a/2.astro': `<h1>test</h1>`,
			'/src/pages/a/3.astro': `<h1>test</h1>`,
			'/src/pages/modules/[...slug].astro': `<h1>test</h1>`,
			'/src/pages/modules/index.astro': `<h1>test</h1>`,
			'/src/pages/test/[...slug].astro': `<h1>test</h1>`,
			'/src/pages/test/index.astro': `<h1>test</h1>`,
			'/src/pages/index.astro': `<h1>test</h1>`,
		});
		const settings = await createBasicSettings({
			root: fixture.path,
			base: '/search',
			trailingSlash: 'never',
		});

		const manifest = await createRoutesList({
			cwd: fixture.path,
			settings,
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
		const fixture = await createFixture({
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
		});
		const settings = await createBasicSettings({
			root: fixture.path,
			base: '/search',
			trailingSlash: 'never',
		});

		const manifest = await createRoutesList({
			cwd: fixture.path,
			settings,
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

	it('injected routes are sorted alongside filesystem routes', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': `<h1>test</h1>`,
			'/src/pages/blog/[...slug].astro': `<h1>test</h1>`,
			'/src/entrypoint.astro': `<h1>test</h1>`,
		});
		const settings = await createBasicSettings({
			root: fixture.path,
			output: 'server',
			base: '/search',
			trailingSlash: 'never',
		});

		settings.injectedRoutes = [
			{
				pattern: '/contributing',
				entrypoint: 'src/entrypoint.astro',
			},
			{
				pattern: '/[...slug]',
				entrypoint: 'src/entrypoint.astro',
				priority: 'normal',
			},
		];

		const manifest = await createRoutesList({
			cwd: fixture.path,
			settings,
		});

		assert.deepEqual(getManifestRoutes(manifest), [
			{
				route: '/_image',
				type: 'endpoint',
			},
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

	it('redirects are sorted alongside the filesystem routes', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': `<h1>test</h1>`,
			'/src/pages/blog/contributing.astro': `<h1>test</h1>`,
		});
		const settings = await createBasicSettings({
			root: fixture.path,
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
		});
		const manifest = await createRoutesList({
			cwd: fixture.path,
			settings,
		});

		assert.deepEqual(getManifestRoutes(manifest), [
			{
				route: '/_image',
				type: 'endpoint',
			},
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

	it('report colliding static routes', async () => {
		const fixture = await createFixture({
			'/src/pages/contributing.astro': `<h1>test</h1>`,
			'/src/entrypoint.astro': `<h1>test</h1>`,
		});
		const settings = await createBasicSettings({
			root: fixture.path,
			output: 'server',
			base: '/search',
			trailingSlash: 'never',
			integrations: [],
		});

		settings.injectedRoutes = [
			{
				pattern: '/contributing',
				entrypoint: 'src/entrypoint.astro',
			},
		];

		const manifestOptions = {
			cwd: fixture.path,
			settings,
		};

		const { logger, logs } = getLogger();

		await createRoutesList(manifestOptions, logger);

		assert.deepEqual(logs, [
			{
				label: 'router',
				level: 'warn',
				message:
					'The route "/contributing" is defined in both "src/pages/contributing.astro" and "src/entrypoint.astro". A static route cannot be defined more than once.',
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
		const fixture = await createFixture({
			'/src/pages/[foo].astro': `<h1>test</h1>`,
			'/src/pages/[bar].astro': `<h1>test</h1>`,
		});
		const settings = await createBasicSettings({
			root: fixture.path,
			output: 'server',
			base: '/search',
			trailingSlash: 'never',
			integrations: [],
		});

		const manifestOptions = {
			cwd: fixture.path,
			settings,
		};

		const { logger, logs } = getLogger();

		await createRoutesList(manifestOptions, logger);

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
		const fixture = await createFixture({
			'/src/pages/a-[b].astro': `<h1>test</h1>`,
			'/src/pages/blog/a-[b].233.ts': ``,
			'/src/entrypoint.astro': `<h1>test</h1>`,
		});

		const settings = await createBasicSettings({
			root: fixture.path,
			output: 'server',
			base: '/search',
			trailingSlash: 'never',
			redirects: {
				'/posts/a-[b].233': '/blog/a-[b].233',
			},
		});

		settings.injectedRoutes = [
			{
				pattern: '/[c]-d',
				entrypoint: 'src/entrypoint.astro',
				priority: 'normal',
			},
		];

		const manifest = await createRoutesList({
			cwd: fixture.path,
			settings,
		});

		assert.deepEqual(getManifestRoutes(manifest), [
			{ type: 'endpoint', route: '/_image' },
			{ type: 'endpoint', route: '/blog/a-[b].233' },
			{ type: 'redirect', route: '/posts/a-[b].233' },
			{ type: 'page', route: '/[c]-d' },
			{ type: 'page', route: '/a-[b]' },
		]);
	});
});

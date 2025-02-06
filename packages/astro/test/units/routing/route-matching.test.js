import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { createContainer } from '../../../dist/core/dev/container.js';
import { createViteLoader } from '../../../dist/core/module-loader/vite.js';
import { createRoutesList, matchAllRoutes } from '../../../dist/core/routing/index.js';
import { getSortedPreloadedMatches } from '../../../dist/prerender/routing.js';
import { DevPipeline } from '../../../dist/vite-plugin-astro-server/pipeline.js';
import { createDevelopmentManifest } from '../../../dist/vite-plugin-astro-server/plugin.js';
import testAdapter from '../../test-adapter.js';
import {
	createBasicSettings,
	createFixture,
	createRequestAndResponse,
	defaultLogger,
} from '../test-utils.js';

const fileSystem = {
	'/src/pages/[serverDynamic].astro': `
		---
		export const prerender = false;
		---
		<p>Server dynamic route! slug:{Astro.params.serverDynamic}</p>
		`,

	'/src/pages/[xStaticDynamic].astro': `
		---
		export function getStaticPaths() {
			return [
				{
					params: {
						xStaticDynamic: "static-dynamic-route-here",
					},
				},
			];
		}
		---
		<p>Prerendered dynamic route!</p>
		`,
	'/src/pages/[aStaticDynamic].astro': `
			---
			export function getStaticPaths() {
				return [
					{
						params: {
							aStaticDynamic: "another-static-dynamic-route-here",
						},
					},
				];
			}
			---
			<p>Another prerendered dynamic route!</p>
	`,
	'/src/pages/[...serverRest].astro': `
	---
	export const prerender = false;
	---
	<p>Server rest route! slug:{Astro.params.serverRest}</p>
	`,
	'/src/pages/[...xStaticRest].astro': `
		---
		export function getStaticPaths() {
			return [
				{
					params: {
						xStaticRest: undefined,
					},
				},
			];
		}
		---
		<p>Prerendered rest route!</p>
`,
	'/src/pages/[...aStaticRest].astro': `
		---
		export function getStaticPaths() {
			return [
				{
					params: {
						aStaticRest: "another/static-rest-route-here",
					},
				},
			];
		}
		---
		<p>Another prerendered rest route!</p>
`,

	'/src/pages/nested/[...serverRest].astro': `
	---
	export const prerender = false;
	---
	<p>Nested server rest route! slug: {Astro.params.serverRest}</p>
	`,
	'/src/pages/nested/[...xStaticRest].astro': `
		---
		export function getStaticPaths() {
			return [
				{
					params: {
						xStaticRest: undefined,
					},
				},
			];
		}
		---
		<p>Nested prerendered rest route!</p>
`,
	'/src/pages/nested/[...aStaticRest].astro': `
		---
		export function getStaticPaths() {
			return [
				{
					params: {
						aStaticRest: "another-nested-static-dynamic-rest-route-here",
					},
				},
			];
		}
		---
		<p>Another nested prerendered rest route!</p>
`,
};

describe('Route matching', () => {
	let pipeline;
	let manifestData;
	let container;
	let settings;

	before(async () => {
		const fixture = await createFixture(fileSystem);
		settings = await createBasicSettings({
			root: fixture.path,
			trailingSlash: 'never',
			output: 'static',
			adapter: testAdapter(),
		});
		container = await createContainer({
			settings,
			logger: defaultLogger,
		});

		const loader = createViteLoader(container.viteServer);
		const manifest = createDevelopmentManifest(container.settings);
		pipeline = DevPipeline.create(undefined, { loader, logger: defaultLogger, manifest, settings });
		manifestData = await createRoutesList(
			{
				cwd: fixture.path,
				settings,
			},
			defaultLogger,
		);
	});

	after(async () => {
		await container.close();
	});

	describe('Matched routes', () => {
		it('should be sorted correctly', async () => {
			const matches = matchAllRoutes('/try-matching-a-route', manifestData);
			const preloadedMatches = await getSortedPreloadedMatches({ pipeline, matches, settings });
			const sortedRouteNames = preloadedMatches.map((match) => match.route.route);

			assert.deepEqual(sortedRouteNames, [
				'/[astaticdynamic]',
				'/[xstaticdynamic]',
				'/[serverdynamic]',
				'/[...astaticrest]',
				'/[...xstaticrest]',
				'/[...serverrest]',
			]);
		});
		it('nested should be sorted correctly', async () => {
			const matches = matchAllRoutes('/nested/try-matching-a-route', manifestData);
			const preloadedMatches = await getSortedPreloadedMatches({ pipeline, matches, settings });
			const sortedRouteNames = preloadedMatches.map((match) => match.route.route);

			assert.deepEqual(sortedRouteNames, [
				'/nested/[...astaticrest]',
				'/nested/[...xstaticrest]',
				'/nested/[...serverrest]',
				'/[...astaticrest]',
				'/[...xstaticrest]',
				'/[...serverrest]',
			]);
		});
	});

	describe('Request', () => {
		it('should correctly match a static dynamic route I', async () => {
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '/static-dynamic-route-here',
			});
			container.handle(req, res);
			const html = await text();
			const $ = cheerio.load(html);
			assert.equal($('p').text(), 'Prerendered dynamic route!');
		});

		it('should correctly match a static dynamic route II', async () => {
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '/another-static-dynamic-route-here',
			});
			container.handle(req, res);
			const html = await text();
			const $ = cheerio.load(html);
			assert.equal($('p').text(), 'Another prerendered dynamic route!');
		});

		it('should correctly match a server dynamic route', async () => {
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '/a-random-slug-was-matched',
			});
			container.handle(req, res);
			const html = await text();
			const $ = cheerio.load(html);
			assert.equal($('p').text(), 'Server dynamic route! slug:a-random-slug-was-matched');
		});

		it('should correctly match a static rest route I', async () => {
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '',
			});
			container.handle(req, res);
			const html = await text();
			const $ = cheerio.load(html);
			assert.equal($('p').text(), 'Prerendered rest route!');
		});

		it('should correctly match a static rest route II', async () => {
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '/another/static-rest-route-here',
			});
			container.handle(req, res);
			const html = await text();
			const $ = cheerio.load(html);
			assert.equal($('p').text(), 'Another prerendered rest route!');
		});

		it('should correctly match a nested static rest route index', async () => {
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '/nested',
			});
			container.handle(req, res);
			const html = await text();
			const $ = cheerio.load(html);
			assert.equal($('p').text(), 'Nested prerendered rest route!');
		});

		it('should correctly match a nested static rest route', async () => {
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '/nested/another-nested-static-dynamic-rest-route-here',
			});
			container.handle(req, res);
			const html = await text();
			const $ = cheerio.load(html);
			assert.equal($('p').text(), 'Another nested prerendered rest route!');
		});

		it('should correctly match a nested server rest route', async () => {
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '/nested/a-random-slug-was-matched',
			});
			container.handle(req, res);

			const html = await text();
			const $ = cheerio.load(html);
			assert.equal($('p').text(), 'Nested server rest route! slug: a-random-slug-was-matched');
		});
	});
});

import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createFixture, createRequestAndResponse, runInContainer } from '../test-utils.js';

describe('base configuration', () => {
	describe('with trailingSlash: "never"', () => {
		describe('index route', () => {
			it('Requests that include a trailing slash 404', async () => {
				const fixture = await createFixture({
					'/src/pages/index.astro': `<h1>testing</h1>`,
				});

				await runInContainer(
					{
						inlineConfig: {
							root: fixture.path,
							base: '/docs',
							trailingSlash: 'never',
						},
					},
					async (container) => {
						const { req, res, done } = createRequestAndResponse({
							method: 'GET',
							url: '/docs/',
						});
						container.handle(req, res);
						await done;
						assert.equal(res.statusCode, 404);
					},
				);
			});

			it('Requests that exclude a trailing slash 200', async () => {
				const fixture = await createFixture({
					'/src/pages/index.astro': `<h1>testing</h1>`,
				});

				await runInContainer(
					{
						fs,
						inlineConfig: {
							root: fixture.path,
							base: '/docs',
							trailingSlash: 'never',
						},
					},
					async (container) => {
						const { req, res, done } = createRequestAndResponse({
							method: 'GET',
							url: '/docs',
						});
						container.handle(req, res);
						await done;
						assert.equal(res.statusCode, 200);
					},
				);
			});
		});

		describe('sub route', () => {
			it('Requests that include a trailing slash 404', async () => {
				const fixture = await createFixture({
					'/src/pages/sub/index.astro': `<h1>testing</h1>`,
				});

				await runInContainer(
					{
						inlineConfig: {
							root: fixture.path,
							base: '/docs',
							trailingSlash: 'never',
						},
					},
					async (container) => {
						const { req, res, done } = createRequestAndResponse({
							method: 'GET',
							url: '/docs/sub/',
						});
						container.handle(req, res);
						await done;
						assert.equal(res.statusCode, 404);
					},
				);
			});

			it('Requests that exclude a trailing slash 200', async () => {
				const fixture = await createFixture({
					'/src/pages/sub/index.astro': `<h1>testing</h1>`,
				});

				await runInContainer(
					{
						inlineConfig: {
							root: fixture.path,
							base: '/docs',
							trailingSlash: 'never',
						},
					},
					async (container) => {
						const { req, res, done } = createRequestAndResponse({
							method: 'GET',
							url: '/docs/sub',
						});
						container.handle(req, res);
						await done;
						assert.equal(res.statusCode, 200);
					},
				);
			});
		});
	});
});

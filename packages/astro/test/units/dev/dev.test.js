import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { createFixture, createRequestAndResponse, runInContainer } from '../test-utils.js';

describe('dev container', () => {
	it('can render requests', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': `
				---
				const name = 'Testing';
				---
				<html>
					<head><title>{name}</title></head>
					<body>
						<h1>{name}</h1>
					</body>
				</html>
			`,
		});

		await runInContainer({ inlineConfig: { root: fixture.path } }, async (container) => {
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '/',
			});
			container.handle(req, res);
			const html = await text();
			const $ = cheerio.load(html);
			assert.equal(res.statusCode, 200);
			assert.equal($('h1').length, 1);
		});
	});

	it('Allows dynamic segments in injected routes', async () => {
		const fixture = await createFixture({
			'/src/components/test.astro': `<h1>{Astro.params.slug}</h1>`,
			'/src/pages/test-[slug].astro': `<h1>{Astro.params.slug}</h1>`,
		});

		await runInContainer(
			{
				inlineConfig: {
					root: fixture.path,
					output: 'server',
					integrations: [
						{
							name: '@astrojs/test-integration',
							hooks: {
								'astro:config:setup': ({ injectRoute }) => {
									injectRoute({
										pattern: '/another-[slug]',
										entrypoint: './src/components/test.astro',
									});
								},
							},
						},
					],
				},
			},
			async (container) => {
				let r = createRequestAndResponse({
					method: 'GET',
					url: '/test-one',
				});
				container.handle(r.req, r.res);
				await r.done;
				assert.equal(r.res.statusCode, 200);

				// Try with the injected route
				r = createRequestAndResponse({
					method: 'GET',
					url: '/another-two',
				});
				container.handle(r.req, r.res);
				await r.done;
				assert.equal(r.res.statusCode, 200);
			},
		);
	});

	it('Serves injected 404 route for any 404', async () => {
		const fixture = await createFixture({
			'/src/components/404.astro': `<h1>Custom 404</h1>`,
			'/src/pages/page.astro': `<h1>Regular page</h1>`,
		});

		await runInContainer(
			{
				inlineConfig: {
					root: fixture.path,
					output: 'server',
					integrations: [
						{
							name: '@astrojs/test-integration',
							hooks: {
								'astro:config:setup': ({ injectRoute }) => {
									injectRoute({
										pattern: '/404',
										entrypoint: './src/components/404.astro',
									});
								},
							},
						},
					],
				},
			},
			async (container) => {
				{
					// Regular pages are served as expected.
					const r = createRequestAndResponse({ method: 'GET', url: '/page' });
					container.handle(r.req, r.res);
					await r.done;
					const doc = await r.text();
					assert.equal(doc.includes('Regular page'), true);
					assert.equal(r.res.statusCode, 200);
				}
				{
					// `/404` serves the custom 404 page as expected.
					const r = createRequestAndResponse({ method: 'GET', url: '/404' });
					container.handle(r.req, r.res);
					await r.done;
					const doc = await r.text();
					assert.equal(doc.includes('Custom 404'), true);
					assert.equal(r.res.statusCode, 404);
				}
				{
					// A non-existent page also serves the custom 404 page.
					const r = createRequestAndResponse({ method: 'GET', url: '/other-page' });
					container.handle(r.req, r.res);
					await r.done;
					const doc = await r.text();
					assert.equal(doc.includes('Custom 404'), true);
					assert.equal(r.res.statusCode, 404);
				}
			},
		);
	});

	it('items in public/ are not available from root when using a base', async () => {
		const fixture = await createFixture({
			'/public/test.txt': `Test`,
		});

		await runInContainer(
			{
				inlineConfig: {
					root: fixture.path,
					base: '/sub/',
				},
			},
			async (container) => {
				// First try the subpath
				let r = createRequestAndResponse({
					method: 'GET',
					url: '/sub/test.txt',
				});

				container.handle(r.req, r.res);
				await r.done;

				assert.equal(r.res.statusCode, 200);

				// Next try the root path
				r = createRequestAndResponse({
					method: 'GET',
					url: '/test.txt',
				});

				container.handle(r.req, r.res);
				await r.done;

				assert.equal(r.res.statusCode, 404);
			},
		);
	});

	it('items in public/ are available from root when not using a base', async () => {
		const fixture = await createFixture({
			'/public/test.txt': `Test`,
		});

		await runInContainer({ inlineConfig: { root: fixture.path } }, async (container) => {
			// Try the root path
			let r = createRequestAndResponse({
				method: 'GET',
				url: '/test.txt',
			});

			container.handle(r.req, r.res);
			await r.done;

			assert.equal(r.res.statusCode, 200);
		});
	});
});

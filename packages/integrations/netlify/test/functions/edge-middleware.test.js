import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { loadFixture } from '../../../../astro/test/test-utils.js';

describe(
	'Middleware',
	() => {
		const root = new URL('./fixtures/middleware/', import.meta.url);

		describe('edgeMiddleware: false', () => {
			let fixture;
			before(async () => {
				process.env.EDGE_MIDDLEWARE = 'false';
				fixture = await loadFixture({ root });
				await fixture.build();
			});

			it('emits no edge function', async () => {
				assert.equal(
					fixture.pathExists('../.netlify/v1/edge-functions/middleware/middleware.mjs'),
					false,
				);
			});

			it('applies middleware to static files at build-time', async () => {
				// prerendered page has middleware applied at build time
				const prerenderedPage = await fixture.readFile('prerender/index.html');
				assert.equal(prerenderedPage.includes('<title>Middleware</title>'), true);
			});

			after(async () => {
				process.env.EDGE_MIDDLEWARE = undefined;
				await fixture.clean();
			});
		});

		describe('edgeMiddleware: true', () => {
			let fixture;
			before(async () => {
				process.env.EDGE_MIDDLEWARE = 'true';
				fixture = await loadFixture({ root });
				await fixture.build();
			});

			it('emits an edge function', async () => {
				const contents = await fixture.readFile(
					'../.netlify/v1/edge-functions/middleware/middleware.mjs',
				);
				assert.equal(contents.includes('"Hello world"'), false);
			});

			it.skip('does not apply middleware during prerendering', async () => {
				const prerenderedPage = await fixture.readFile('prerender/index.html');
				assert.equal(prerenderedPage.includes('<title></title>'), true);
			});

			after(async () => {
				process.env.EDGE_MIDDLEWARE = undefined;
				await fixture.clean();
			});
		});
	},
	{
		timeout: 120000,
	},
);

import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createContainer } from '../../../dist/core/dev/container.js';
import { createLoader } from '../../../dist/core/module-loader/index.js';
import { createRoutesList } from '../../../dist/core/routing/index.js';
import { createComponent, render } from '../../../dist/runtime/server/index.js';
import { createController, handleRequest } from '../../../dist/vite-plugin-astro-server/index.js';
import { DevPipeline } from '../../../dist/vite-plugin-astro-server/pipeline.js';
import { createDevelopmentManifest } from '../../../dist/vite-plugin-astro-server/plugin.js';
import testAdapter from '../../test-adapter.js';
import {
	createAstroModule,
	createBasicSettings,
	createFixture,
	createRequestAndResponse,
	defaultLogger,
} from '../test-utils.js';

async function createDevPipeline(overrides = {}, root) {
	const settings = overrides.settings ?? (await createBasicSettings({ root }));
	const loader = overrides.loader ?? createLoader();
	const manifest = createDevelopmentManifest(settings);
	const routesList = await createRoutesList(
		{
			cwd: root,
			settings: settings,
		},
		defaultLogger,
	);
	return DevPipeline.create(routesList, { loader, logger: defaultLogger, manifest, settings });
}

describe('vite-plugin-astro-server', () => {
	describe('request', () => {
		it('renders a request', async () => {
			const fixture = await createFixture({
				// Note that the content doesn't matter here because we are using a custom loader.
				'/src/pages/index.astro': '',
			});

			const pipeline = await createDevPipeline(
				{
					loader: createLoader({
						import(id) {
							if (id === '\0astro-internal:middleware') {
								return { onRequest: (_, next) => next() };
							}
							const Page = createComponent(() => {
								return render`<div id="test">testing</div>`;
							});
							return createAstroModule(Page);
						},
					}),
				},
				fixture.path,
			);
			const controller = createController({ loader: pipeline.loader });
			const { req, res, text } = createRequestAndResponse();

			try {
				await handleRequest({
					pipeline,
					routesList: pipeline.routesList,
					controller,
					incomingRequest: req,
					incomingResponse: res,
					manifest: {},
				});
			} catch (err) {
				assert.equal(err.message, undefined);
			}

			const html = await text();
			assert.equal(res.statusCode, 200);
			assert.equal(html.includes('<div id="test">'), true);
		});
	});

	describe('url', () => {
		let container;
		let settings;

		before(async () => {
			const fileSystem = {
				'/src/pages/url.astro': `{Astro.request.url}`,
				'/src/pages/prerendered.astro': `---
			export const prerender = true;
			---
			{Astro.request.url}`,
			};
			const fixture = await createFixture(fileSystem);
			settings = await createBasicSettings({
				root: fixture.path,
				output: 'server',
				adapter: testAdapter(),
			});
			container = await createContainer({
				settings,
				logger: defaultLogger,
			});
		});

		after(async () => {
			await container.close();
		});

		it('params are included', async () => {
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '/url?xyz=123',
			});
			container.handle(req, res);
			assert.equal(res.statusCode, 200);

			const html = await text();
			assert.deepEqual(html, '<!DOCTYPE html>http://localhost/url?xyz=123');
		});

		it('params are excluded on prerendered routes', async () => {
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '/prerendered?xyz=123',
			});
			container.handle(req, res);
			const html = await text();
			assert.equal(res.statusCode, 200);

			assert.deepEqual(html, '<!DOCTYPE html>http://localhost/prerendered');
		});
	});
});

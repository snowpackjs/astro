import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createContainer } from '../../../dist/core/dev/container.js';
import testAdapter from '../../test-adapter.js';
import {
	createBasicSettings,
	createFixture,
	createRequestAndResponse,
	defaultLogger,
} from '../test-utils.js';

const fileSystem = {
	'/src/pages/api.ts': `export const GET = () => Response.json({ success: true })`,
	'/src/pages/dot.json.ts': `export const GET = () => Response.json({ success: true })`,
};

describe('trailingSlash', () => {
	let container;
	let settings;

	before(async () => {
		const fixture = await createFixture(fileSystem);
		settings = await createBasicSettings({
			root: fixture.path,
			trailingSlash: 'always',
			output: 'server',
			adapter: testAdapter(),
			integrations: [
				{
					name: 'test',
					hooks: {
						'astro:config:setup': ({ injectRoute }) => {
							injectRoute({
								pattern: '/injected',
								entrypoint: './src/pages/api.ts',
							});
							injectRoute({
								pattern: '/injected.json',
								entrypoint: './src/pages/api.ts',
							});
						},
					},
				},
			],
		});
		container = await createContainer({
			settings,
			logger: defaultLogger,
		});
	});

	after(async () => {
		await container.close();
	});

	it('should match the API route when request has a trailing slash', async () => {
		const { req, res, text } = createRequestAndResponse({
			method: 'GET',
			url: '/api/',
		});
		container.handle(req, res);
		const json = await text();
		assert.equal(json, '{"success":true}');
	});

	it('should NOT match the API route when request lacks a trailing slash', async () => {
		const { req, res, text } = createRequestAndResponse({
			method: 'GET',
			url: '/api',
		});
		container.handle(req, res);
		const html = await text();
		assert.equal(html.includes(`<span class="statusMessage">Not found</span>`), true);
		assert.equal(res.statusCode, 404);
	});

	it('should match an injected route when request has a trailing slash', async () => {
		const { req, res, text } = createRequestAndResponse({
			method: 'GET',
			url: '/injected/',
		});
		container.handle(req, res);
		const json = await text();
		assert.equal(json, '{"success":true}');
	});

	it('should NOT match an injected route when request lacks a trailing slash', async () => {
		const { req, res, text } = createRequestAndResponse({
			method: 'GET',
			url: '/injected',
		});
		container.handle(req, res);
		const html = await text();
		assert.equal(html.includes(`<span class="statusMessage">Not found</span>`), true);
		assert.equal(res.statusCode, 404);
	});

	it('should match an injected route when request has a file extension and no slash', async () => {
		const { req, res, text } = createRequestAndResponse({
			method: 'GET',
			url: '/injected.json',
		});
		container.handle(req, res);
		const json = await text();
		assert.equal(json, '{"success":true}');
	});

	it('should match the API route when request has a trailing slash, with a file extension', async () => {
		const { req, res, text } = createRequestAndResponse({
			method: 'GET',
			url: '/dot.json/',
		});
		container.handle(req, res);
		const json = await text();
		assert.equal(json, '{"success":true}');
	});

	it('should also match the API route when request lacks a trailing slash, with a file extension', async () => {
		const { req, res, text } = createRequestAndResponse({
			method: 'GET',
			url: '/dot.json',
		});
		container.handle(req, res);
		const json = await text();
		assert.equal(json, '{"success":true}');
	});
});

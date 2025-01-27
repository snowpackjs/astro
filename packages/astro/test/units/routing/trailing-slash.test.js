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
});

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

const root = new URL('../../fixtures/api-routes/', import.meta.url);
const fileSystem = {
	'/src/pages/incorrect.ts': `export const GET = _ => {}`,
};

describe('endpoints', () => {
	let container;
	let settings;

	before(async () => {
		const fixture = await createFixture(fileSystem, root);
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

	it('should respond with 500 for incorrect implementation', async () => {
		const { req, res, done } = createRequestAndResponse({
			method: 'GET',
			url: '/incorrect',
		});
		container.handle(req, res);
		await done;
		assert.equal(res.statusCode, 500);
	});
});

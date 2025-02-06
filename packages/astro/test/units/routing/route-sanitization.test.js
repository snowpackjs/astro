import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { createContainer } from '../../../dist/core/dev/container.js';
import testAdapter from '../../test-adapter.js';
import {
	createBasicSettings,
	createFixture,
	createRequestAndResponse,
	defaultLogger,
} from '../test-utils.js';

const fileSystem = {
	'/src/pages/[...testSlashTrim].astro': `
	---
	export function getStaticPaths() {
		return [
			{
				params: {
					testSlashTrim: "/a-route-param-with-leading-trailing-slash/",
				},
			},
		];
	}
	---
	<p>Success!</p>
`,
};

describe('Route sanitization', () => {
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
	});

	after(async () => {
		await container.close();
	});

	describe('Request', () => {
		it('should correctly match a route param with a trailing slash', async () => {
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '/a-route-param-with-leading-trailing-slash',
			});
			container.handle(req, res);
			const html = await text();
			const $ = cheerio.load(html);
			assert.equal($('p').text(), 'Success!');
		});
	});
});

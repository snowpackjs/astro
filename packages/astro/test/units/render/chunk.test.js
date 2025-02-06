import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { createFixture, createRequestAndResponse, runInContainer } from '../test-utils.js';

describe('core/render chunk', () => {
	it('does not throw on user object with type', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': `\
				---
				const value = { type: 'foobar' }
				---
				<div id="chunk">{value}</div>
			`,
		});

		await runInContainer(
			{
				inlineConfig: {
					root: fixture.path,
					logLevel: 'silent',
					integrations: [],
				},
			},
			async (container) => {
				const { req, res, done, text } = createRequestAndResponse({
					method: 'GET',
					url: '/',
				});
				container.handle(req, res);

				await done;
				try {
					const html = await text();
					const $ = cheerio.load(html);
					const target = $('#chunk');

					assert.ok(target);
					assert.equal(target.text(), '[object Object]');
				} catch {
					assert.fail();
				}
			},
		);
	});
});

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Dynamic endpoint collision', () => {
	describe('build', () => {
		let fixture;
		let errorMsg;
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/dynamic-endpoint-collision/',
			});
			try {
				await fixture.build();
			} catch (error) {
				errorMsg = error;
			}
		});

		it('throw error when dynamic endpoint has path collision', async () => {
			assert.equal(errorMsg.name, 'PrerenderDynamicEndpointPathCollide');
		});
	});

	describe('dev', () => {
		let fixture;
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/dynamic-endpoint-collision/',
			});

			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('throw error when dynamic endpoint has path collision', async () => {
			const html = await fixture.fetch('/api/catch').then((res) => res.text());
			const $ = cheerioLoad(html);
			assert.equal($('title').text(), 'PrerenderDynamicEndpointPathCollide');
		});

		it("don't throw error when dynamic endpoint doesn't load the colliding path", async () => {
			const res = await fixture.fetch('/api/catch/one').then((r) => r.text());
			assert.equal(res, '{"slug":"one"}');
		});

		it('returns 404 when user visits dynamic endpoint that has collision but not specified in getStaticPaths', async () => {
			const res = await fixture.fetch('/api/safe');
			assert.equal(res.status, 404);
		});
	});
});

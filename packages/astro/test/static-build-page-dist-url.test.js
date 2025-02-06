import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Static build: pages routes have distURL', () => {
	/** @type {RouteData[]} */
	let checkRoutes;
	before(async () => {
		/** @type {import('./test-utils').Fixture} */
		const fixture = await loadFixture({
			root: './fixtures/astro pages/',
			integrations: [
				{
					name: '@astrojs/distURL',
					hooks: {
						'astro:build:done': ({ routes }) => {
							checkRoutes = routes.filter((p) => p.type === 'page');
						},
					},
				},
			],
		});
		await fixture.build();
	});
	it('Pages routes have distURL', async () => {
		assert.equal(checkRoutes.length > 0, true, 'Pages not found: build end hook not being called');
		checkRoutes.forEach((p) => {
			p.distURL.forEach((distURL) => {
				assert.equal(distURL instanceof URL, true, `${p.pathname} doesn't include distURL`);
			});
		});
	});
});

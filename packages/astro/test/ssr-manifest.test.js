import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('astro:ssr-manifest', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/ssr-manifest/',
		});
		await fixture.build();
	});

	it('works', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/manifest.json');
		const response = await app.render(request);
		const manifest = await response.json();
		assert.equal(typeof manifest, 'object');
		assert.equal(manifest.adapterName, 'my-ssr-adapter');
	});

	it('includes compressHTML', async () => {
		const app = await fixture.loadTestAdapterApp();
		// NOTE: `app.manifest` is actually a private property
		assert.equal(app.manifest.compressHTML, true);
	});

	it('includes correct routes', async () => {
		const app = await fixture.loadTestAdapterApp();
		// NOTE: `app.manifest` is actually a private property

		const manifestJsonEndpoint = app.manifest.routes.find(
			(route) => route.routeData.route === '/manifest.json',
		);
		assert.ok(manifestJsonEndpoint);
		assert.equal(manifestJsonEndpoint.routeData.prerender, false);

		// There should be no route for prerendered injected routes
		const injectedEndpoint = app.manifest.routes.find(
			(route) => route.routeData.route === '/[...slug]',
		);
		assert.equal(injectedEndpoint, undefined);
	});
});

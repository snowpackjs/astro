// @ts-check
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

// Asset bundling
describe('Returning responses', () => {
	/** @type {Awaited<ReturnType<typeof loadFixture>>} */
	let fixture;
	/** @type {import('./test-utils').DevServer} */
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-response/',
		});

		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('Works from a page', async () => {
		const response = await fixture.fetch('/not-found');
		assert.equal(response.status, 404);
	});

	it('Returns the default 404 is body is null', async () => {
		const response = await fixture.fetch('/not-found');
		const html = await response.text();

		assert.equal(response.status, 404);
		assert.equal(html.includes('<pre>Path: /not-found</pre>'), true);
	});

	it('Returns the page is body is not null', async () => {
		const response = await fixture.fetch('/not-found-custom');
		const html = await response.text();

		assert.equal(response.status, 404);
		assert.equal(html.includes('Custom 404'), true);
	});
});

import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('virtual routes - dev', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/virtual-routes/',
		});
		await fixture.build();
	});

	it('should render a virtual route - dev', async () => {
		const devServer = await fixture.startDevServer();
		const response = await fixture.fetch('/virtual');
		const html = await response.text();
		assert.equal(html.includes('Virtual!!'), true);
		await devServer.stop();
	});

	it('should render a virtual route - app', async () => {
		const app = await fixture.loadTestAdapterApp();
		const response = await app.render(new Request('https://example.com/virtual'));
		const html = await response.text();
		assert.equal(html.includes('Virtual!!'), true);
	});
});

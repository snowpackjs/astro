import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Using Astro.response in SSR', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/ssr-response/',
			adapter: testAdapter(),
			output: 'server',
		});
		await fixture.build();
	});

	it('Can set the status', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/status-code');
		const response = await app.render(request);
		assert.equal(response.status, 404);
	});

	it('Can set the statusText', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/status-code');
		const response = await app.render(request);
		assert.equal(response.statusText, 'Oops');
	});

	it('Can set headers for 404 page', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/status-code');
		const response = await app.render(request);
		const headers = response.headers;
		assert.equal(headers.get('one-two'), 'three');
	});

	it('Can add headers', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/some-header');
		const response = await app.render(request);
		const headers = response.headers;
		assert.equal(headers.get('one-two'), 'three');
		assert.equal(headers.get('four-five'), 'six');
		assert.equal(headers.get('Cache-Control'), `max-age=0, s-maxage=86400`);
	});
});

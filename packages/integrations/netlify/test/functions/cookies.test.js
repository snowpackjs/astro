import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from '../../../../astro/test/test-utils.js';

describe(
	'Cookies',
	() => {
		let fixture;

		before(async () => {
			fixture = await loadFixture({ root: new URL('./fixtures/cookies/', import.meta.url) });
			await fixture.build();
		});

		it('Can set multiple', async () => {
			const entryURL = new URL(
				'./fixtures/cookies/.netlify/v1/functions/ssr/ssr.mjs',
				import.meta.url,
			);
			const { default: handler } = await import(entryURL);
			const resp = await handler(
				new Request('http://example.com/login', { method: 'POST', body: '{}' }),
				{},
			);
			assert.equal(resp.status, 301);
			assert.equal(resp.headers.get('location'), '/');
			assert.deepEqual(resp.headers.getSetCookie(), ['foo=foo; HttpOnly', 'bar=bar; HttpOnly']);
		});

		it('renders dynamic 404 page', async () => {
			const entryURL = new URL(
				'./fixtures/cookies/.netlify/v1/functions/ssr/ssr.mjs',
				import.meta.url,
			);
			const { default: handler } = await import(entryURL);
			const resp = await handler(
				new Request('http://example.com/nonexistant-page', {
					headers: {
						'x-test': 'bar',
					},
				}),
				{},
			);
			assert.equal(resp.status, 404);
			const text = await resp.text();
			assert.equal(text.includes('This is my custom 404 page'), true);
			assert.equal(text.includes('x-test: bar'), true);
		});
	},
	{
		timeout: 120000,
	},
);

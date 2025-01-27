import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as devalue from 'devalue';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Astro.session', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/sessions/',
			output: 'server',
			adapter: testAdapter(),
		});
	});

	describe('Production', () => {
		let app;
		before(async () => {
			await fixture.build();
			app = await fixture.loadTestAdapterApp();
		});

		async function fetchResponse(path, requestInit) {
			const request = new Request('http://example.com' + path, requestInit);
			const response = await app.render(request);
			return response;
		}

		it('can regenerate session cookies upon request', async () => {
			const firstResponse = await fetchResponse('/regenerate', { method: 'GET' });
			const firstHeaders = Array.from(app.setCookieHeaders(firstResponse));
			const firstSessionId = firstHeaders[0].split(';')[0].split('=')[1];

			const secondResponse = await fetchResponse('/regenerate', {
				method: 'GET',
				headers: {
					cookie: `astro-session=${firstSessionId}`,
				},
			});
			const secondHeaders = Array.from(app.setCookieHeaders(secondResponse));
			const secondSessionId = secondHeaders[0].split(';')[0].split('=')[1];
			assert.notEqual(firstSessionId, secondSessionId);
		});

		it('can save session data by value', async () => {
			const firstResponse = await fetchResponse('/update', { method: 'GET' });
			const firstValue = await firstResponse.json();
			assert.equal(firstValue.previousValue, 'none');

			const firstHeaders = Array.from(app.setCookieHeaders(firstResponse));
			const firstSessionId = firstHeaders[0].split(';')[0].split('=')[1];
			const secondResponse = await fetchResponse('/update', {
				method: 'GET',
				headers: {
					cookie: `astro-session=${firstSessionId}`,
				},
			});
			const secondValue = await secondResponse.json();
			assert.equal(secondValue.previousValue, 'expected');
		});

		it('can save and restore URLs in session data', async () => {
			const firstResponse = await fetchResponse('/_actions/addUrl', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ favoriteUrl: 'https://domain.invalid' }),
			});

			assert.equal(firstResponse.ok, true);
			const firstHeaders = Array.from(app.setCookieHeaders(firstResponse));
			const firstSessionId = firstHeaders[0].split(';')[0].split('=')[1];

			const data = devalue.parse(await firstResponse.text());
			assert.equal(data.message, 'Favorite URL set to https://domain.invalid/ from nothing');
			const secondResponse = await fetchResponse('/_actions/addUrl', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					cookie: `astro-session=${firstSessionId}`,
				},
				body: JSON.stringify({ favoriteUrl: 'https://example.com' }),
			});
			const secondData = devalue.parse(await secondResponse.text());
			assert.equal(
				secondData.message,
				'Favorite URL set to https://example.com/ from https://domain.invalid/',
			);
		});
	});
});

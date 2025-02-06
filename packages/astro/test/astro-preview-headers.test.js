import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Astro preview headers', () => {
	let fixture;
	let previewServer;
	const headers = {
		astro: 'test',
	};

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-preview-headers/',
			server: {
				headers,
			},
		});
		await fixture.build();
		previewServer = await fixture.preview();
	});

	// important: close preview server (free up port and connection)
	after(async () => {
		await previewServer.stop();
	});

	describe('preview', () => {
		it('returns custom headers for valid URLs', async () => {
			const result = await fixture.fetch('/');
			assert.equal(result.status, 200);
			assert.equal(Object.fromEntries(result.headers).astro, headers.astro);
		});

		it('does not return custom headers for invalid URLs', async () => {
			const result = await fixture.fetch('/bad-url');
			assert.equal(result.status, 404);
			assert.equal(Object.fromEntries(result.headers).hasOwnProperty('astro'), false);
		});
	});
});

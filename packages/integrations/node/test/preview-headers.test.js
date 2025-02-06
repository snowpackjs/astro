import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import nodejs from '../dist/index.js';
import { loadFixture } from './test-utils.js';

describe('Astro preview headers', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devPreview;
	const headers = {
		astro: 'test',
	};

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/preview-headers/',
			output: 'server',
			adapter: nodejs({ mode: 'standalone' }),
			server: {
				headers,
			},
		});
		await fixture.build();
		devPreview = await fixture.preview();
	});

	after(async () => {
		await devPreview.stop();
	});

	describe('Preview Headers', () => {
		it('returns custom headers for valid URLs', async () => {
			const result = await fixture.fetch('/');
			assert.equal(result.status, 200);
			assert.equal(Object.fromEntries(result.headers).astro, headers.astro);
		});
	});
});

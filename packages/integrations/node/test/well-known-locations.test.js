import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import nodejs from '../dist/index.js';
import { loadFixture } from './test-utils.js';

describe('test URIs beginning with a dot', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/well-known-locations/',
			output: 'server',
			adapter: nodejs({ mode: 'standalone' }),
		});
		await fixture.build();
	});

	describe('can load well-known URIs', async () => {
		let devPreview;

		before(async () => {
			devPreview = await fixture.preview();
		});

		after(async () => {
			await devPreview.stop();
		});

		it('can load a valid well-known URI', async () => {
			const res = await fixture.fetch('/.well-known/apple-app-site-association');

			assert.equal(res.status, 200);

			const json = await res.json();

			assert.notEqual(json.applinks, {});
		});

		it('cannot load a dot folder that is not a well-known URI', async () => {
			const res = await fixture.fetch('/.hidden/file.json');

			assert.equal(res.status, 404);
		});
	});
});

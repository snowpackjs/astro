import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Custom 404 with injectRoute from dependency', () => {
	describe('build', () => {
		/** @type {import('./test-utils.js').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/custom-404-injected-from-dep/',
				site: 'http://example.com',
			});
			await fixture.build();
		});

		it('Build succeeds', async () => {
			const html = await fixture.readFile('/404.html');
			assert.equal(html.includes('<!DOCTYPE html>'), true);
		});
	});
});

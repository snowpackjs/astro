import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('AstroConfig - config.output', () => {
	describe(`output: 'server'`, () => {
		describe('deploy config provided', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;

			before(async () => {
				fixture = await loadFixture({
					// This is just a random fixture to test, doesn't matter.
					root: './fixtures/astro-basic/',
					adapter: testAdapter(),
					output: 'server',
				});
				await fixture.build();
			});

			it('Builds an SSR-able app', async () => {
				const app = await fixture.loadTestAdapterApp();
				const request = new Request('http://example.com/');
				const response = await app.render(request);
				assert.equal(response.status, 200);
				assert.equal(response.headers.get('content-type'), 'text/html');
				const html = await response.text();
				assert.equal(html.length > 0, true);
			});
		});

		describe('deploy config omitted', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;

			before(async () => {
				fixture = await loadFixture({
					// This is just a random fixture to test, doesn't matter.
					root: './fixtures/astro-basic/',
					output: 'server',
				});
			});

			it('Throws during the build', async () => {
				let built = false;
				try {
					await fixture.build();
					built = true;
				} catch (err) {
					assert.equal(err instanceof Error, true);
					assert.match(err.message, /without an adapter/);
				}

				assert.equal(built, false, 'Should not have built');
			});
		});
	});

	describe(`output: 'static'`, () => {
		describe('Output config omitted', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;

			before(async () => {
				fixture = await loadFixture({
					// This is just a random fixture to test, doesn't matter.
					root: './fixtures/astro-basic/',
					output: 'static',
				});
				await fixture.build();
			});

			it('Builds to static HTML', async () => {
				let html;
				try {
					html = await fixture.readFile('/index.html');
				} catch {
					assert.equal(false, true, 'Couldnt find the file, which mean it did not build.');
				}
				assert.equal(html.length > 0, true);
			});
		});

		describe.skip('deploy config provided - TODO, we need adapters to support static mode first', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;

			before(async () => {
				fixture = await loadFixture({
					// This is just a random fixture to test, doesn't matter.
					root: './fixtures/astro-basic/',
					adapter: testAdapter(),
					output: 'server',
				});
				await fixture.build();
			});
		});
	});
});

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

for (const caseNumber of [1, 2, 3, 4, 5]) {
	describe(`Custom 404 with implicit rerouting - Case #${caseNumber}`, () => {
		/** @type {import('./test-utils.js').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				output: 'server',
				root: `./fixtures/custom-404-loop-case-${caseNumber}/`,
				site: 'http://example.com',
				adapter: testAdapter(),
			});
		});

		describe('dev server', () => {
			/** @type {import('./test-utils.js').DevServer} */
			let devServer;

			before(async () => {
				await fixture.build();
				devServer = await fixture.startDevServer();
			});

			// sanity check
			it('dev server handles normal requests', { timeout: 1000 }, async () => {
				const response = await fixture.fetch('/');
				assert.equal(response.status, 200);
			});

			// IMPORTANT: never skip
			it('dev server stays responsive', { timeout: 1000 }, async () => {
				const response = await fixture.fetch('/alvsibdlvjks');
				assert.equal(response.status, 404);
			});

			after(async () => {
				await devServer.stop();
			});
		});

		describe('prod server', () => {
			/** @type {import('./test-utils.js').App} */
			let app;

			before(async () => {
				app = await fixture.loadTestAdapterApp();
			});

			// sanity check
			it('prod server handles normal requests', { timeout: 1000 }, async () => {
				const response = await app.render(new Request('https://example.com/'));
				assert.equal(response.status, 200);
			});

			// IMPORTANT: never skip
			it(
				'prod server stays responsive for case number ' + caseNumber,
				{ timeout: 1000 },
				async () => {
					const response = await app.render(new Request('https://example.com/alvsibdlvjks'));
					assert.equal(response.status, 404);
				},
			);
		});
	});
}

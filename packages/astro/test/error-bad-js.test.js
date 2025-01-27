import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Errors in JavaScript', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			output: 'server',
			adapter: testAdapter(),
			root: './fixtures/error-bad-js',
			vite: {
				logLevel: 'silent',
			},
		});
	});

	describe('dev', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('Does not crash the dev server', async () => {
			let res = await fixture.fetch('/');
			let html = await res.text();

			assert.equal(html.includes('ReferenceError'), true);

			res = await fixture.fetch('/');
			await res.text();

			assert.equal(html.includes('ReferenceError'), true);
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('in nested components, does not crash server', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/in-stream');
			const response = await app.render(request);

			try {
				await response.text();
				assert.ok(false, 'error expected');
			} catch {
				assert.ok(true, 'error caught during render');
			}
		});
	});
});

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { isWindows, loadFixture } from './test-utils.js';

let fixture;

describe('Impostor MDX File', () => {
	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/impostor-mdx-file/',
		});
	});
	if (isWindows) return;

	describe('dev', () => {
		/** @type {import('./test-utils').Fixture} */
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('does not crash when loading react component with .md or .mdx in name', async () => {
			const result = await fixture.fetch('/').then((response) => response.text());
			assert.equal(result.includes('Baz'), true);
		});
	});
});

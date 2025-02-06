import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('streaming', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/streaming/',
		});
		await fixture.build();
	});

	it('makes it to vercel function configuration', async () => {
		const vcConfig = JSON.parse(
			await fixture.readFile('../.vercel/output/functions/_render.func/.vc-config.json')
		);
		assert.equal(vcConfig.supportsResponseStreaming, true);
	});
});

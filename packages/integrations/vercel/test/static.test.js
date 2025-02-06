import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('static routing', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/static/',
		});
		await fixture.build();
	});

	it('falls back to 404.html', async () => {
		const deploymentConfig = JSON.parse(await fixture.readFile('../.vercel/output/config.json'));
		// change the index if necesseary
		assert.deepEqual(deploymentConfig.routes[2], {
			src: '^/.*$',
			dest: '/404.html',
			status: 404,
		});
	});
});

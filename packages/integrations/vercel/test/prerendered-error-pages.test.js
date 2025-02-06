import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('prerendered error pages routing', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/prerendered-error-pages/',
		});
		await fixture.build();
	});

	it('falls back to 404.html', async () => {
		const deploymentConfig = JSON.parse(await fixture.readFile('../.vercel/output/config.json'));
		assert.deepEqual(
			deploymentConfig.routes.find((r) => r.status === 404),
			{
				src: '^/.*$',
				dest: '/404.html',
				status: 404,
			}
		);
	});
});

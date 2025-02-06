import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Serverless with dynamic routes', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		process.env.PRERENDER = true;
		fixture = await loadFixture({
			root: './fixtures/serverless-with-dynamic-routes/',
			output: 'server',
		});
		await fixture.build();
	});

	it('build successful', async () => {
		assert.ok(await fixture.readFile('../.vercel/output/static/index.html'));
		assert.ok(await fixture.readFile('../.vercel/output/functions/_render.func/.vc-config.json'));
	});
});

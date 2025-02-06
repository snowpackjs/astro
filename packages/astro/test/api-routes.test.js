import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('API routes', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/api-routes/' });
		await fixture.build();
	});

	describe('Binary data', () => {
		it('can be returned from a response', async () => {
			const dat = await fixture.readFile('/binary.dat', null);
			assert.equal(dat.length, 1);
			assert.equal(dat[0], 0xff);
		});
	});
});

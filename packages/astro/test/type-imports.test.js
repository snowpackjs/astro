import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Type Imports', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/type-imports' });
		await fixture.build();
	});

	it('Allows importing types from "astro"', () => {
		// if the build passes then the test succeeds
		assert.equal(true, true);
	});
});

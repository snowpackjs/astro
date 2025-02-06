import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Vue with multi-renderer', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/vue-with-multi-renderer/',
		});
	});

	it('builds with another renderer present', async () => {
		try {
			await fixture.build();
		} catch (e) {
			assert.equal(e, undefined, `Should not throw`);
		}
	});
});

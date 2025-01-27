import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('custom the assets name function', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/custom-assets-name/',
			output: 'server',
		});
		await fixture.build();
	});

	it('It cant find this file cause the node throws an error if the users custom a path that includes the folder path', async () => {
		const csslength = await fixture.readFile('client/assets/css/a.css');
		/** @type {Set<string>} */
		assert.equal(!!csslength, true);
	});
});

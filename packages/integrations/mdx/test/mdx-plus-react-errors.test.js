import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadFixture } from '../../../astro/test/test-utils.js';

function hookError() {
	const error = console.error;
	const errors = [];
	console.error = function (...args) {
		errors.push(args);
	};
	return () => {
		console.error = error;
		return errors;
	};
}

describe('MDX and React with build errors', () => {
	let fixture;
	let unhook;

	it('shows correct error messages on build error', async () => {
		try {
			fixture = await loadFixture({
				root: new URL('./fixtures/mdx-plus-react-errors/', import.meta.url),
			});
			unhook = hookError();
			await fixture.build();
		} catch (err) {
			assert.equal(err.message, 'a is not defined');
		}
		unhook();
	});
});

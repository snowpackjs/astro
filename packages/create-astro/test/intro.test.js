import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { intro } from '../dist/index.js';
import { setup } from './utils.js';

describe('intro', () => {
	const fixture = setup();

	it('no arguments', async () => {
		await intro({ skipHouston: false, version: '0.0.0', username: 'user' });
		assert.ok(fixture.hasMessage('Houston:'));
		assert.ok(fixture.hasMessage('Welcome to  astro  v0.0.0'));
	});
	it('--skip-houston', async () => {
		await intro({ skipHouston: true, version: '0.0.0', username: 'user' });
		assert.equal(fixture.length(), 1);
		assert.ok(!fixture.hasMessage('Houston:'));
		assert.ok(fixture.hasMessage('Launch sequence initiated'));
	});
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { next } from '../dist/index.js';
import { setup } from './utils.js';

describe('next steps', () => {
	const fixture = setup();

	it('no arguments', async () => {
		await next({ skipHouston: false, cwd: './it/fixtures/not-empty', packageManager: 'npm' });
		assert.ok(fixture.hasMessage('Liftoff confirmed.'));
		assert.ok(fixture.hasMessage('npm run dev'));
		assert.ok(fixture.hasMessage('Good luck out there, astronaut!'));
	});

	it('--skip-houston', async () => {
		await next({ skipHouston: true, cwd: './it/fixtures/not-empty', packageManager: 'npm' });
		assert.ok(!fixture.hasMessage('Good luck out there, astronaut!'));
	});
});

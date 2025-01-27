import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { dependencies } from '../dist/index.js';
import { setup } from './utils.js';
describe('integrations', () => {
	const fixture = setup();

	it('--add node', async () => {
		const context = {
			cwd: '',
			yes: true,
			packageManager: 'npm',
			dryRun: true,
			add: ['node'],
		};

		await dependencies(context);

		assert.ok(fixture.hasMessage('--dry-run Skipping dependency installation and adding node'));
	});

	it('--add node --add react', async () => {
		const context = {
			cwd: '',
			yes: true,
			packageManager: 'npm',
			dryRun: true,
			add: ['node', 'react'],
		};

		await dependencies(context);

		assert.ok(
			fixture.hasMessage('--dry-run Skipping dependency installation and adding node, react'),
		);
	});

	it('--add node,react', async () => {
		const context = {
			cwd: '',
			yes: true,
			packageManager: 'npm',
			dryRun: true,
			add: ['node,react'],
		};

		await dependencies(context);

		assert.ok(
			fixture.hasMessage('--dry-run Skipping dependency installation and adding node, react'),
		);
	});

	it('-y', async () => {
		const context = {
			cwd: '',
			yes: true,
			packageManager: 'npm',
			dryRun: true,
		};
		await dependencies(context);
		assert.ok(fixture.hasMessage('--dry-run Skipping dependency installation'));
	});
});

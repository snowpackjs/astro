import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { after, before, describe, it } from 'node:test';

import { git } from '../dist/index.js';
import { setup } from './utils.js';

describe('git', () => {
	const fixture = setup();

	it('none', async () => {
		const context = { cwd: '', dryRun: true, prompt: () => ({ git: false }) };
		await git(context);

		assert.ok(fixture.hasMessage('Skipping Git initialization'));
	});

	it('yes (--dry-run)', async () => {
		const context = { cwd: '', dryRun: true, prompt: () => ({ git: true }) };
		await git(context);
		assert.ok(fixture.hasMessage('Skipping Git initialization'));
	});

	it('no (--dry-run)', async () => {
		const context = { cwd: '', dryRun: true, prompt: () => ({ git: false }) };
		await git(context);

		assert.ok(fixture.hasMessage('Skipping Git initialization'));
	});
});

describe('git initialized', () => {
	const fixture = setup();
	const dir = new URL(new URL('./fixtures/not-empty/.git', import.meta.url));

	before(async () => {
		await mkdir(dir, { recursive: true });
		await writeFile(new URL('./git.json', dir), '{}', { encoding: 'utf8' });
	});

	it('already initialized', async () => {
		const context = {
			git: true,
			cwd: './test/fixtures/not-empty',
			dryRun: false,
			prompt: () => ({ git: false }),
		};
		await git(context);

		assert.ok(fixture.hasMessage('Git has already been initialized'));
	});

	after(() => {
		rmSync(dir, { recursive: true, force: true });
	});
});

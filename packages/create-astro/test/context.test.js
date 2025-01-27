import assert from 'node:assert/strict';
import os from 'node:os';
import { describe, it } from 'node:test';
import { getContext } from '../dist/index.js';
describe('context', () => {
	it('no arguments', async () => {
		const ctx = await getContext([]);
		assert.ok(!ctx.projectName);
		assert.ok(!ctx.template);
		assert.deepEqual(ctx.skipHouston, os.platform() === 'win32');
		assert.ok(!ctx.dryRun);
	});

	it('project name', async () => {
		const ctx = await getContext(['foobar']);
		assert.deepEqual(ctx.projectName, 'foobar');
	});

	it('template', async () => {
		const ctx = await getContext(['--template', 'minimal']);
		assert.deepEqual(ctx.template, 'minimal');
	});

	it('skip houston (explicit)', async () => {
		const ctx = await getContext(['--skip-houston']);
		assert.deepEqual(ctx.skipHouston, true);
	});

	it('skip houston (yes)', async () => {
		const ctx = await getContext(['-y']);
		assert.deepEqual(ctx.skipHouston, true);
	});

	it('skip houston (no)', async () => {
		const ctx = await getContext(['-n']);
		assert.deepEqual(ctx.skipHouston, true);
	});

	it('skip houston (install)', async () => {
		const ctx = await getContext(['--install']);
		assert.deepEqual(ctx.skipHouston, true);
	});

	it('dry run', async () => {
		const ctx = await getContext(['--dry-run']);
		assert.deepEqual(ctx.dryRun, true);
	});

	it('install', async () => {
		const ctx = await getContext(['--install']);
		assert.deepEqual(ctx.install, true);
	});

	it('add', async () => {
		const ctx = await getContext(['--add', 'node']);
		assert.deepEqual(ctx.add, ['node']);
	});

	it('no install', async () => {
		const ctx = await getContext(['--no-install']);
		assert.deepEqual(ctx.install, false);
	});

	it('git', async () => {
		const ctx = await getContext(['--git']);
		assert.deepEqual(ctx.git, true);
	});

	it('no git', async () => {
		const ctx = await getContext(['--no-git']);
		assert.deepEqual(ctx.git, false);
	});
});

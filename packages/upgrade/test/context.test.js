import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getContext } from '../dist/index.js';

describe('context', () => {
	it('no arguments', async () => {
		const ctx = await getContext([]);
		assert.equal(ctx.version, 'latest');
		assert.equal(ctx.dryRun, undefined);
	});
	it('tag', async () => {
		const ctx = await getContext(['beta']);
		assert.equal(ctx.version, 'beta');
		assert.equal(ctx.dryRun, undefined);
	});
	it('dry run', async () => {
		const ctx = await getContext(['--dry-run']);
		assert.equal(ctx.dryRun, true);
	});
});

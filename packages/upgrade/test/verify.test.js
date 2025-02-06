import * as assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { collectPackageInfo } from '../dist/index.js';

describe('collectPackageInfo', () => {
	const context = {
		cwd: '',
		version: 'latest',
		packageManager: 'npm',
		dryRun: true,
		packages: [],
	};

	beforeEach(() => {
		context.packages = [];
	});

	it('detects astro', async () => {
		collectPackageInfo(context, { astro: '1.0.0' }, {});
		assert.deepEqual(context.packages, [
			{ name: 'astro', currentVersion: '1.0.0', targetVersion: 'latest' },
		]);
	});

	it('detects @astrojs', async () => {
		collectPackageInfo(context, { '@astrojs/preact': '1.0.0' }, {});
		assert.deepEqual(context.packages, [
			{ name: '@astrojs/preact', currentVersion: '1.0.0', targetVersion: 'latest' },
		]);
	});

	it('supports ^ prefixes', async () => {
		collectPackageInfo(context, { astro: '^1.0.0' }, {});
		assert.deepEqual(context.packages, [
			{ name: 'astro', currentVersion: '^1.0.0', targetVersion: 'latest' },
		]);
	});

	it('supports ~ prefixes', async () => {
		collectPackageInfo(context, { astro: '~1.0.0' }, {});
		assert.deepEqual(context.packages, [
			{ name: 'astro', currentVersion: '~1.0.0', targetVersion: 'latest' },
		]);
	});

	it('supports prereleases', async () => {
		collectPackageInfo(context, { astro: '1.0.0-beta.0' }, {});
		assert.deepEqual(context.packages, [
			{ name: 'astro', currentVersion: '1.0.0-beta.0', targetVersion: 'latest' },
		]);
	});

	it('ignores self', async () => {
		collectPackageInfo(context, { '@astrojs/upgrade': '0.0.1' }, {});
		assert.deepEqual(context.packages, []);
	});

	it('ignores linked packages', async () => {
		collectPackageInfo(context, { '@astrojs/preact': 'link:../packages/preact' }, {});
		assert.deepEqual(context.packages, []);
	});

	it('ignores workspace packages', async () => {
		collectPackageInfo(context, { '@astrojs/preact': 'workspace:*' }, {});
		assert.deepEqual(context.packages, []);
	});

	it('ignores github packages', async () => {
		collectPackageInfo(context, { '@astrojs/preact': 'github:withastro/astro' }, {});
		assert.deepEqual(context.packages, []);
	});

	it('ignores tag', async () => {
		collectPackageInfo(context, { '@astrojs/preact': 'beta' }, {});
		assert.deepEqual(context.packages, []);
	});
});

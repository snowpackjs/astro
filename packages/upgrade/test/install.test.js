import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { install } from '../dist/index.js';
import { setup } from './utils.js';

describe('install', () => {
	const fixture = setup();
	const ctx = {
		cwd: '',
		version: 'latest',
		packageManager: 'npm',
		dryRun: true,
	};

	it('up to date', async () => {
		const context = {
			...ctx,
			packages: [
				{
					name: 'astro',
					currentVersion: '1.0.0',
					targetVersion: '1.0.0',
				},
			],
		};
		await install(context);
		assert.equal(fixture.hasMessage('◼  astro is up to date on v1.0.0'), true);
	});

	it('patch', async () => {
		const context = {
			...ctx,
			packages: [
				{
					name: 'astro',
					currentVersion: '1.0.0',
					targetVersion: '1.0.1',
				},
			],
		};
		await install(context);
		assert.equal(fixture.hasMessage('●  astro can be updated from v1.0.0 to v1.0.1'), true);
	});

	it('minor', async () => {
		const context = {
			...ctx,
			packages: [
				{
					name: 'astro',
					currentVersion: '1.0.0',
					targetVersion: '1.2.0',
				},
			],
		};
		await install(context);
		assert.equal(fixture.hasMessage('●  astro can be updated from v1.0.0 to v1.2.0'), true);
	});

	it('major (reject)', async () => {
		let prompted = false;
		let exitCode;
		const context = {
			...ctx,
			prompt: () => {
				prompted = true;
				return { proceed: false };
			},
			exit: (code) => {
				exitCode = code;
			},
			packages: [
				{
					name: 'astro',
					currentVersion: '1.0.0',
					targetVersion: '2.0.0',
					isMajor: true,
					changelogTitle: 'CHANGELOG',
					changelogURL: 'https://example.com',
				},
			],
		};
		await install(context);
		assert.equal(fixture.hasMessage('▲  astro can be updated  from v1.0.0 to v2.0.0'), true);
		assert.equal(prompted, true);
		assert.equal(exitCode, 0);
		assert.equal(fixture.hasMessage('check   Be sure to follow the CHANGELOG.'), false);
	});

	it('major (accept)', async () => {
		let prompted = false;
		let exitCode;
		const context = {
			...ctx,
			prompt: () => {
				prompted = true;
				return { proceed: true };
			},
			exit: (code) => {
				exitCode = code;
			},
			packages: [
				{
					name: 'astro',
					currentVersion: '1.0.0',
					targetVersion: '2.0.0',
					isMajor: true,
					changelogTitle: 'CHANGELOG',
					changelogURL: 'https://example.com',
				},
			],
		};
		await install(context);
		assert.equal(fixture.hasMessage('▲  astro can be updated  from v1.0.0 to v2.0.0'), true);
		assert.equal(prompted, true);
		assert.equal(exitCode, undefined);
		assert.equal(fixture.hasMessage('check   Be sure to follow the CHANGELOG.'), true);
	});

	it('multiple major', async () => {
		let prompted = false;
		let exitCode;
		const context = {
			...ctx,
			prompt: () => {
				prompted = true;
				return { proceed: true };
			},
			exit: (code) => {
				exitCode = code;
			},
			packages: [
				{
					name: 'a',
					currentVersion: '1.0.0',
					targetVersion: '2.0.0',
					isMajor: true,
					changelogTitle: 'CHANGELOG',
					changelogURL: 'https://example.com',
				},
				{
					name: 'b',
					currentVersion: '6.0.0',
					targetVersion: '7.0.0',
					isMajor: true,
					changelogTitle: 'CHANGELOG',
					changelogURL: 'https://example.com',
				},
			],
		};
		await install(context);
		assert.equal(fixture.hasMessage('▲  a can be updated  from v1.0.0 to v2.0.0'), true);
		assert.equal(fixture.hasMessage('▲  b can be updated  from v6.0.0 to v7.0.0'), true);
		assert.equal(prompted, true);
		assert.equal(exitCode, undefined);
		const [changelog, a, b] = fixture.messages().slice(-5);
		assert.match(changelog, /^check/);
		assert.match(a, /^a/);
		assert.match(b, /^b/);
	});

	it('current patch minor major', async () => {
		let prompted = false;
		let exitCode;
		const context = {
			...ctx,
			prompt: () => {
				prompted = true;
				return { proceed: true };
			},
			exit: (code) => {
				exitCode = code;
			},
			packages: [
				{
					name: 'current',
					currentVersion: '1.0.0',
					targetVersion: '1.0.0',
				},
				{
					name: 'patch',
					currentVersion: '1.0.0',
					targetVersion: '1.0.1',
				},
				{
					name: 'minor',
					currentVersion: '1.0.0',
					targetVersion: '1.2.0',
				},
				{
					name: 'major',
					currentVersion: '1.0.0',
					targetVersion: '3.0.0',
					isMajor: true,
					changelogTitle: 'CHANGELOG',
					changelogURL: 'https://example.com',
				},
			],
		};
		await install(context);
		assert.equal(fixture.hasMessage('◼  current is up to date on v1.0.0'), true);
		assert.equal(fixture.hasMessage('●  patch can be updated from v1.0.0 to v1.0.1'), true);
		assert.equal(fixture.hasMessage('●  minor can be updated from v1.0.0 to v1.2.0'), true);
		assert.equal(fixture.hasMessage('▲  major can be updated  from v1.0.0 to v3.0.0'), true);
		assert.equal(prompted, true);
		assert.equal(exitCode, undefined);
		assert.equal(fixture.hasMessage('check   Be sure to follow the CHANGELOG.'), true);
		const [changelog, major] = fixture.messages().slice(-4);
		assert.match(changelog, /^check/);
		assert.match(major, /^major/);
	});
});

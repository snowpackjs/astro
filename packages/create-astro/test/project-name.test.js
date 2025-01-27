import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { projectName } from '../dist/index.js';
import { setup } from './utils.js';

describe('project name', async () => {
	const fixture = setup();

	it('pass in name', async () => {
		const context = { projectName: '', cwd: './foo/bar/baz', prompt: () => {} };
		await projectName(context);
		assert.equal(context.cwd, './foo/bar/baz');
		assert.equal(context.projectName, 'baz');
	});

	it('dot', async () => {
		const context = { projectName: '', cwd: '.', prompt: () => ({ name: 'foobar' }) };
		await projectName(context);
		assert.ok(fixture.hasMessage('"." is not empty!'));
		assert.equal(context.projectName, 'foobar');
	});

	it('dot slash', async () => {
		const context = { projectName: '', cwd: './', prompt: () => ({ name: 'foobar' }) };
		await projectName(context);
		assert.ok(fixture.hasMessage('"./" is not empty!'));
		assert.equal(context.projectName, 'foobar');
	});

	it('empty', async () => {
		const context = {
			projectName: '',
			cwd: './test/fixtures/empty',
			prompt: () => ({ name: 'foobar' }),
		};
		await projectName(context);
		assert.ok(!fixture.hasMessage('"./test/fixtures/empty" is not empty!'));
		assert.equal(context.projectName, 'empty');
	});

	it('not empty', async () => {
		const context = {
			projectName: '',
			cwd: './test/fixtures/not-empty',
			prompt: () => ({ name: 'foobar' }),
		};
		await projectName(context);
		assert.ok(fixture.hasMessage('"./test/fixtures/not-empty" is not empty!'));
		assert.equal(context.projectName, 'foobar');
	});

	it('basic', async () => {
		const context = { projectName: '', cwd: '', prompt: () => ({ name: 'foobar' }) };
		await projectName(context);
		assert.equal(context.cwd, 'foobar');
		assert.equal(context.projectName, 'foobar');
	});

	it('head and tail blank spaces should be trimmed', async () => {
		const context = { projectName: '', cwd: '', prompt: () => ({ name: '  foobar  ' }) };
		await projectName(context);
		assert.equal(context.cwd, 'foobar');
		assert.equal(context.projectName, 'foobar');
	});

	it('normalize', async () => {
		const context = { projectName: '', cwd: '', prompt: () => ({ name: 'Invalid Name' }) };
		await projectName(context);
		assert.equal(context.cwd, 'Invalid Name');
		assert.equal(context.projectName, 'invalid-name');
	});

	it('remove leading/trailing dashes', async () => {
		const context = { projectName: '', cwd: '', prompt: () => ({ name: '(invalid)' }) };
		await projectName(context);
		assert.equal(context.projectName, 'invalid');
	});

	it('handles scoped packages', async () => {
		const context = { projectName: '', cwd: '', prompt: () => ({ name: '@astro/site' }) };
		await projectName(context);
		assert.equal(context.cwd, '@astro/site');
		assert.equal(context.projectName, '@astro/site');
	});

	it('--yes', async () => {
		const context = { projectName: '', cwd: './foo/bar/baz', yes: true, prompt: () => {} };
		await projectName(context);
		assert.equal(context.projectName, 'baz');
	});

	it('dry run with name', async () => {
		const context = {
			projectName: '',
			cwd: './foo/bar/baz',
			dryRun: true,
			prompt: () => {},
		};
		await projectName(context);
		assert.equal(context.projectName, 'baz');
	});

	it('dry run with dot', async () => {
		const context = {
			projectName: '',
			cwd: '.',
			dryRun: true,
			prompt: () => ({ name: 'foobar' }),
		};
		await projectName(context);
		assert.equal(context.projectName, 'foobar');
	});

	it('dry run with empty', async () => {
		const context = {
			projectName: '',
			cwd: './test/fixtures/empty',
			dryRun: true,
			prompt: () => ({ name: 'foobar' }),
		};
		await projectName(context);
		assert.equal(context.projectName, 'empty');
	});
});

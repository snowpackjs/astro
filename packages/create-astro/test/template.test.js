import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { template } from '../dist/index.js';
import { setup } from './utils.js';

describe('template', async () => {
	const fixture = setup();

	it('none', async () => {
		const context = { template: '', cwd: '', dryRun: true, prompt: () => ({ template: 'blog' }) };
		await template(context);
		assert.ok(fixture.hasMessage('Skipping template copying'));
		assert.equal(context.template, 'blog');
	});

	it('minimal (--dry-run)', async () => {
		const context = { template: 'minimal', cwd: '', dryRun: true, prompt: () => {} };
		await template(context);
		assert.ok(fixture.hasMessage('Using minimal as project template'));
	});

	it('basics (--dry-run)', async () => {
		const context = { template: 'basics', cwd: '', dryRun: true, prompt: () => {} };
		await template(context);
		assert.ok(fixture.hasMessage('Using basics as project template'));
	});

	it('blog (--dry-run)', async () => {
		const context = { template: 'blog', cwd: '', dryRun: true, prompt: () => {} };
		await template(context);
		assert.ok(fixture.hasMessage('Using blog as project template'));
	});

	it('minimal (--yes)', async () => {
		const context = { template: 'minimal', cwd: '', dryRun: true, yes: true, prompt: () => {} };
		await template(context);
		assert.ok(fixture.hasMessage('Using minimal as project template'));
	});
});

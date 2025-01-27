import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { loadFixture } from '../../astro/test/test-utils.js';
import { setupRemoteDbServer } from './test-utils.js';

const foreignKeyConstraintError =
	'LibsqlError: SQLITE_CONSTRAINT_FOREIGNKEY: FOREIGN KEY constraint failed';

describe('astro:db - error handling', () => {
	let fixture;
	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/error-handling/', import.meta.url),
		});
	});

	describe('development', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('Raises foreign key constraint LibsqlError', async () => {
			const json = await fixture.fetch('/foreign-key-constraint.json').then((res) => res.json());
			assert.deepEqual(json, {
				message: foreignKeyConstraintError,
				code: 'SQLITE_CONSTRAINT_FOREIGNKEY',
			});
		});
	});

	describe('build --remote', () => {
		let remoteDbServer;

		before(async () => {
			remoteDbServer = await setupRemoteDbServer(fixture.config);
			await fixture.build();
		});

		after(async () => {
			await remoteDbServer?.stop();
		});

		it('Raises foreign key constraint LibsqlError', async () => {
			const json = await fixture.readFile('/foreign-key-constraint.json');
			assert.deepEqual(JSON.parse(json), {
				message: foreignKeyConstraintError,
				code: 'SQLITE_CONSTRAINT_FOREIGNKEY',
			});
		});
	});
});

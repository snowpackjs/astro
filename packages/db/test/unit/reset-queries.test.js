import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getMigrationQueries } from '../../dist/core/cli/migration-queries.js';
import { MIGRATION_VERSION } from '../../dist/core/consts.js';
import { tableSchema } from '../../dist/core/schemas.js';
import { column, defineTable } from '../../dist/runtime/virtual.js';

const TABLE_NAME = 'Users';

// `parse` to resolve schema transformations
// ex. convert column.date() to ISO strings
const userInitial = tableSchema.parse(
	defineTable({
		columns: {
			name: column.text(),
			age: column.number(),
			email: column.text({ unique: true }),
			mi: column.text({ optional: true }),
		},
	}),
);

describe('force reset', () => {
	describe('getMigrationQueries', () => {
		it('should drop table and create new version', async () => {
			const oldTables = { [TABLE_NAME]: userInitial };
			const newTables = { [TABLE_NAME]: userInitial };
			const { queries } = await getMigrationQueries({
				oldSnapshot: { schema: oldTables, version: MIGRATION_VERSION },
				newSnapshot: { schema: newTables, version: MIGRATION_VERSION },
				reset: true,
			});

			assert.deepEqual(queries, [
				`DROP TABLE IF EXISTS "${TABLE_NAME}"`,
				`CREATE TABLE "${TABLE_NAME}" (_id INTEGER PRIMARY KEY, "name" text NOT NULL, "age" integer NOT NULL, "email" text NOT NULL UNIQUE, "mi" text)`,
			]);
		});

		it('should not drop table when previous snapshot did not have it', async () => {
			const oldTables = {};
			const newTables = { [TABLE_NAME]: userInitial };
			const { queries } = await getMigrationQueries({
				oldSnapshot: { schema: oldTables, version: MIGRATION_VERSION },
				newSnapshot: { schema: newTables, version: MIGRATION_VERSION },
				reset: true,
			});

			assert.deepEqual(queries, [
				`CREATE TABLE "${TABLE_NAME}" (_id INTEGER PRIMARY KEY, "name" text NOT NULL, "age" integer NOT NULL, "email" text NOT NULL UNIQUE, "mi" text)`,
			]);
		});
	});
});

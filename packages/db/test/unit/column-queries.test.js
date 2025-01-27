import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	getMigrationQueries,
	getTableChangeQueries,
} from '../../dist/core/cli/migration-queries.js';
import { MIGRATION_VERSION } from '../../dist/core/consts.js';
import { tableSchema } from '../../dist/core/schemas.js';
import { NOW, column, defineTable } from '../../dist/runtime/virtual.js';

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

function userChangeQueries(oldTable, newTable) {
	return getTableChangeQueries({
		tableName: TABLE_NAME,
		oldTable,
		newTable,
	});
}

function configChangeQueries(oldTables, newTables) {
	return getMigrationQueries({
		oldSnapshot: { schema: oldTables, version: MIGRATION_VERSION },
		newSnapshot: { schema: newTables, version: MIGRATION_VERSION },
	});
}

describe('column queries', () => {
	describe('getMigrationQueries', () => {
		it('should be empty when tables are the same', async () => {
			const oldTables = { [TABLE_NAME]: userInitial };
			const newTables = { [TABLE_NAME]: userInitial };
			const { queries } = await configChangeQueries(oldTables, newTables);
			assert.deepEqual(queries, []);
		});

		it('should create table for new tables', async () => {
			const oldTables = {};
			const newTables = { [TABLE_NAME]: userInitial };
			const { queries } = await configChangeQueries(oldTables, newTables);
			assert.deepEqual(queries, [
				`CREATE TABLE "${TABLE_NAME}" (_id INTEGER PRIMARY KEY, "name" text NOT NULL, "age" integer NOT NULL, "email" text NOT NULL UNIQUE, "mi" text)`,
			]);
		});

		it('should drop table for removed tables', async () => {
			const oldTables = { [TABLE_NAME]: userInitial };
			const newTables = {};
			const { queries } = await configChangeQueries(oldTables, newTables);
			assert.deepEqual(queries, [`DROP TABLE "${TABLE_NAME}"`]);
		});

		it('should error if possible table rename is detected', async () => {
			const rename = 'Peeps';
			const oldTables = { [TABLE_NAME]: userInitial };
			const newTables = { [rename]: userInitial };
			let error = null;
			try {
				await configChangeQueries(oldTables, newTables);
			} catch (e) {
				error = e.message;
			}
			assert.match(error, /Potential table rename detected/);
		});

		it('should error if possible column rename is detected', async () => {
			const blogInitial = tableSchema.parse({
				columns: {
					title: column.text(),
				},
			});
			const blogFinal = tableSchema.parse({
				columns: {
					title2: column.text(),
				},
			});
			let error = null;
			try {
				await configChangeQueries({ [TABLE_NAME]: blogInitial }, { [TABLE_NAME]: blogFinal });
			} catch (e) {
				error = e.message;
			}
			assert.match(error, /Potential column rename detected/);
		});
	});

	describe('getTableChangeQueries', () => {
		it('should be empty when tables are the same', async () => {
			const { queries } = await userChangeQueries(userInitial, userInitial);
			assert.deepEqual(queries, []);
		});

		it('should return warning if column type change introduces data loss', async () => {
			const blogInitial = tableSchema.parse({
				...userInitial,
				columns: {
					date: column.text(),
				},
			});
			const blogFinal = tableSchema.parse({
				...userInitial,
				columns: {
					date: column.date(),
				},
			});
			const { queries, confirmations } = await userChangeQueries(blogInitial, blogFinal);
			assert.deepEqual(queries, [
				'DROP TABLE "Users"',
				'CREATE TABLE "Users" (_id INTEGER PRIMARY KEY, "date" text NOT NULL)',
			]);
			assert.equal(confirmations.length, 1);
		});

		it('should return warning if new required column added', async () => {
			const blogInitial = tableSchema.parse({
				...userInitial,
				columns: {},
			});
			const blogFinal = tableSchema.parse({
				...userInitial,
				columns: {
					date: column.date({ optional: false }),
				},
			});
			const { queries, confirmations } = await userChangeQueries(blogInitial, blogFinal);
			assert.deepEqual(queries, [
				'DROP TABLE "Users"',
				'CREATE TABLE "Users" (_id INTEGER PRIMARY KEY, "date" text NOT NULL)',
			]);
			assert.equal(confirmations.length, 1);
		});

		it('should return warning if non-number primary key with no default added', async () => {
			const blogInitial = tableSchema.parse({
				...userInitial,
				columns: {},
			});
			const blogFinal = tableSchema.parse({
				...userInitial,
				columns: {
					id: column.text({ primaryKey: true }),
				},
			});
			const { queries, confirmations } = await userChangeQueries(blogInitial, blogFinal);
			assert.deepEqual(queries, [
				'DROP TABLE "Users"',
				'CREATE TABLE "Users" ("id" text PRIMARY KEY)',
			]);
			assert.equal(confirmations.length, 1);
		});

		it('should be empty when type updated to same underlying SQL type', async () => {
			const blogInitial = tableSchema.parse({
				...userInitial,
				columns: {
					title: column.text(),
					draft: column.boolean(),
				},
			});
			const blogFinal = tableSchema.parse({
				...userInitial,
				columns: {
					...blogInitial.columns,
					draft: column.number(),
				},
			});
			const { queries } = await userChangeQueries(blogInitial, blogFinal);
			assert.deepEqual(queries, []);
		});

		it('should respect user primary key without adding a hidden id', async () => {
			const user = tableSchema.parse({
				...userInitial,
				columns: {
					...userInitial.columns,
					id: column.number({ primaryKey: true }),
				},
			});

			const userFinal = tableSchema.parse({
				...user,
				columns: {
					...user.columns,
					name: column.text({ unique: true, optional: true }),
				},
			});

			const { queries } = await userChangeQueries(user, userFinal);
			assert.equal(queries[0] !== undefined, true);
			const tempTableName = getTempTableName(queries[0]);

			assert.deepEqual(queries, [
				`CREATE TABLE \"${tempTableName}\" (\"name\" text UNIQUE, \"age\" integer NOT NULL, \"email\" text NOT NULL UNIQUE, \"mi\" text, \"id\" integer PRIMARY KEY)`,
				`INSERT INTO \"${tempTableName}\" (\"name\", \"age\", \"email\", \"mi\", \"id\") SELECT \"name\", \"age\", \"email\", \"mi\", \"id\" FROM \"Users\"`,
				'DROP TABLE "Users"',
				`ALTER TABLE "${tempTableName}" RENAME TO "Users"`,
			]);
		});

		describe('Lossy table recreate', () => {
			it('when changing a column type', async () => {
				const userFinal = {
					...userInitial,
					columns: {
						...userInitial.columns,
						age: column.text(),
					},
				};

				const { queries } = await userChangeQueries(userInitial, userFinal);

				assert.deepEqual(queries, [
					'DROP TABLE "Users"',
					`CREATE TABLE "Users" (_id INTEGER PRIMARY KEY, "name" text NOT NULL, "age" text NOT NULL, "email" text NOT NULL UNIQUE, "mi" text)`,
				]);
			});

			it('when adding a required column without a default', async () => {
				const userFinal = {
					...userInitial,
					columns: {
						...userInitial.columns,
						phoneNumber: column.text(),
					},
				};

				const { queries } = await userChangeQueries(userInitial, userFinal);

				assert.deepEqual(queries, [
					'DROP TABLE "Users"',
					`CREATE TABLE "Users" (_id INTEGER PRIMARY KEY, "name" text NOT NULL, "age" integer NOT NULL, "email" text NOT NULL UNIQUE, "mi" text, "phoneNumber" text NOT NULL)`,
				]);
			});
		});

		describe('Lossless table recreate', () => {
			it('when adding a primary key', async () => {
				const userFinal = {
					...userInitial,
					columns: {
						...userInitial.columns,
						id: column.number({ primaryKey: true }),
					},
				};

				const { queries } = await userChangeQueries(userInitial, userFinal);
				assert.equal(queries[0] !== undefined, true);

				const tempTableName = getTempTableName(queries[0]);
				assert.deepEqual(queries, [
					`CREATE TABLE \"${tempTableName}\" (\"name\" text NOT NULL, \"age\" integer NOT NULL, \"email\" text NOT NULL UNIQUE, \"mi\" text, \"id\" integer PRIMARY KEY)`,
					`INSERT INTO \"${tempTableName}\" (\"name\", \"age\", \"email\", \"mi\") SELECT \"name\", \"age\", \"email\", \"mi\" FROM \"Users\"`,
					'DROP TABLE "Users"',
					`ALTER TABLE "${tempTableName}" RENAME TO "Users"`,
				]);
			});

			it('when dropping a primary key', async () => {
				const user = {
					...userInitial,
					columns: {
						...userInitial.columns,
						id: column.number({ primaryKey: true }),
					},
				};

				const { queries } = await userChangeQueries(user, userInitial);
				assert.equal(queries[0] !== undefined, true);

				const tempTableName = getTempTableName(queries[0]);
				assert.deepEqual(queries, [
					`CREATE TABLE \"${tempTableName}\" (_id INTEGER PRIMARY KEY, \"name\" text NOT NULL, \"age\" integer NOT NULL, \"email\" text NOT NULL UNIQUE, \"mi\" text)`,
					`INSERT INTO \"${tempTableName}\" (\"name\", \"age\", \"email\", \"mi\") SELECT \"name\", \"age\", \"email\", \"mi\" FROM \"Users\"`,
					'DROP TABLE "Users"',
					`ALTER TABLE "${tempTableName}" RENAME TO "Users"`,
				]);
			});

			it('when adding an optional unique column', async () => {
				const userFinal = {
					...userInitial,
					columns: {
						...userInitial.columns,
						phoneNumber: column.text({ unique: true, optional: true }),
					},
				};

				const { queries } = await userChangeQueries(userInitial, userFinal);
				assert.equal(queries.length, 4);

				const tempTableName = getTempTableName(queries[0]);
				assert.equal(typeof tempTableName, 'string');
				assert.deepEqual(queries, [
					`CREATE TABLE "${tempTableName}" (_id INTEGER PRIMARY KEY, "name" text NOT NULL, "age" integer NOT NULL, "email" text NOT NULL UNIQUE, "mi" text, "phoneNumber" text UNIQUE)`,
					`INSERT INTO "${tempTableName}" ("_id", "name", "age", "email", "mi") SELECT "_id", "name", "age", "email", "mi" FROM "Users"`,
					'DROP TABLE "Users"',
					`ALTER TABLE "${tempTableName}" RENAME TO "Users"`,
				]);
			});

			it('when dropping unique column', async () => {
				const userFinal = {
					...userInitial,
					columns: {
						...userInitial.columns,
					},
				};
				delete userFinal.columns.email;

				const { queries } = await userChangeQueries(userInitial, userFinal);
				assert.equal(queries.length, 4);
				assert.equal(queries.length, 4);

				const tempTableName = getTempTableName(queries[0]);
				assert.equal(typeof tempTableName, 'string');
				assert.deepEqual(queries, [
					`CREATE TABLE "${tempTableName}" (_id INTEGER PRIMARY KEY, "name" text NOT NULL, "age" integer NOT NULL, "mi" text)`,
					`INSERT INTO "${tempTableName}" ("_id", "name", "age", "mi") SELECT "_id", "name", "age", "mi" FROM "Users"`,
					'DROP TABLE "Users"',
					`ALTER TABLE "${tempTableName}" RENAME TO "Users"`,
				]);
			});

			it('when updating to a runtime default', async () => {
				const initial = tableSchema.parse({
					...userInitial,
					columns: {
						...userInitial.columns,
						age: column.date(),
					},
				});

				const userFinal = tableSchema.parse({
					...initial,
					columns: {
						...initial.columns,
						age: column.date({ default: NOW }),
					},
				});

				const { queries } = await userChangeQueries(initial, userFinal);
				assert.equal(queries.length, 4);

				const tempTableName = getTempTableName(queries[0]);
				assert.equal(typeof tempTableName, 'string');
				assert.deepEqual(queries, [
					`CREATE TABLE "${tempTableName}" (_id INTEGER PRIMARY KEY, "name" text NOT NULL, "age" text NOT NULL DEFAULT CURRENT_TIMESTAMP, "email" text NOT NULL UNIQUE, "mi" text)`,
					`INSERT INTO "${tempTableName}" ("_id", "name", "age", "email", "mi") SELECT "_id", "name", "age", "email", "mi" FROM "Users"`,
					'DROP TABLE "Users"',
					`ALTER TABLE "${tempTableName}" RENAME TO "Users"`,
				]);
			});

			it('when adding a column with a runtime default', async () => {
				const userFinal = tableSchema.parse({
					...userInitial,
					columns: {
						...userInitial.columns,
						birthday: column.date({ default: NOW }),
					},
				});

				const { queries } = await userChangeQueries(userInitial, userFinal);
				assert.equal(queries.length, 4);

				const tempTableName = getTempTableName(queries[0]);
				assert.equal(typeof tempTableName, 'string');
				assert.deepEqual(queries, [
					`CREATE TABLE "${tempTableName}" (_id INTEGER PRIMARY KEY, "name" text NOT NULL, "age" integer NOT NULL, "email" text NOT NULL UNIQUE, "mi" text, "birthday" text NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
					`INSERT INTO "${tempTableName}" ("_id", "name", "age", "email", "mi") SELECT "_id", "name", "age", "email", "mi" FROM "Users"`,
					'DROP TABLE "Users"',
					`ALTER TABLE "${tempTableName}" RENAME TO "Users"`,
				]);
			});

			/**
			 * REASON: to follow the "expand" and "contract" migration model,
			 * you'll need to update the schema from NOT NULL to NULL.
			 * It's up to the user to ensure all data follows the new schema!
			 *
			 * @see https://planetscale.com/blog/safely-making-database-schema-changes#backwards-compatible-changes
			 */
			it('when changing a column to required', async () => {
				const userFinal = {
					...userInitial,
					columns: {
						...userInitial.columns,
						mi: column.text(),
					},
				};

				const { queries } = await userChangeQueries(userInitial, userFinal);

				assert.equal(queries.length, 4);

				const tempTableName = getTempTableName(queries[0]);
				assert.equal(typeof tempTableName, 'string');
				assert.deepEqual(queries, [
					`CREATE TABLE "${tempTableName}" (_id INTEGER PRIMARY KEY, "name" text NOT NULL, "age" integer NOT NULL, "email" text NOT NULL UNIQUE, "mi" text NOT NULL)`,
					`INSERT INTO "${tempTableName}" ("_id", "name", "age", "email", "mi") SELECT "_id", "name", "age", "email", "mi" FROM "Users"`,
					'DROP TABLE "Users"',
					`ALTER TABLE "${tempTableName}" RENAME TO "Users"`,
				]);
			});

			it('when changing a column to unique', async () => {
				const userFinal = {
					...userInitial,
					columns: {
						...userInitial.columns,
						age: column.number({ unique: true }),
					},
				};

				const { queries } = await userChangeQueries(userInitial, userFinal);
				assert.equal(queries.length, 4);

				const tempTableName = getTempTableName(queries[0]);
				assert.equal(typeof tempTableName, 'string');
				assert.deepEqual(queries, [
					`CREATE TABLE "${tempTableName}" (_id INTEGER PRIMARY KEY, "name" text NOT NULL, "age" integer NOT NULL UNIQUE, "email" text NOT NULL UNIQUE, "mi" text)`,
					`INSERT INTO "${tempTableName}" ("_id", "name", "age", "email", "mi") SELECT "_id", "name", "age", "email", "mi" FROM "Users"`,
					'DROP TABLE "Users"',
					`ALTER TABLE "${tempTableName}" RENAME TO "Users"`,
				]);
			});
		});

		describe('ALTER ADD COLUMN', () => {
			it('when adding an optional column', async () => {
				const userFinal = {
					...userInitial,
					columns: {
						...userInitial.columns,
						birthday: column.date({ optional: true }),
					},
				};

				const { queries } = await userChangeQueries(userInitial, userFinal);
				assert.deepEqual(queries, ['ALTER TABLE "Users" ADD COLUMN "birthday" text']);
			});

			it('when adding a required column with default', async () => {
				const defaultDate = new Date('2023-01-01');
				const userFinal = tableSchema.parse({
					...userInitial,
					columns: {
						...userInitial.columns,
						birthday: column.date({ default: new Date('2023-01-01') }),
					},
				});

				const { queries } = await userChangeQueries(userInitial, userFinal);
				assert.deepEqual(queries, [
					`ALTER TABLE "Users" ADD COLUMN "birthday" text NOT NULL DEFAULT '${defaultDate.toISOString()}'`,
				]);
			});
		});

		describe('ALTER DROP COLUMN', () => {
			it('when removing optional or required columns', async () => {
				const userFinal = {
					...userInitial,
					columns: {
						name: userInitial.columns.name,
						email: userInitial.columns.email,
					},
				};

				const { queries } = await userChangeQueries(userInitial, userFinal);
				assert.deepEqual(queries, [
					'ALTER TABLE "Users" DROP COLUMN "age"',
					'ALTER TABLE "Users" DROP COLUMN "mi"',
				]);
			});
		});
	});
});

/** @param {string} query */
function getTempTableName(query) {
	return /Users_[a-z\d]+/.exec(query)?.[0];
}

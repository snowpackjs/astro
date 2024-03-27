import { expect } from 'chai';
import { describe, it } from 'mocha';
import { getTableChangeQueries } from '../../dist/core/cli/migration-queries.js';
import { dbConfigSchema, tableSchema } from '../../dist/core/schemas.js';
import { column } from '../../dist/runtime/config.js';

const userInitial = tableSchema.parse({
	columns: {
		name: column.text(),
		age: column.number(),
		email: column.text({ unique: true }),
		mi: column.text({ optional: true }),
	},
	indexes: {},
	writable: false,
});

describe('index queries', () => {
	it('generates index names by table and combined column names', async () => {
		// Use dbConfigSchema.parse to resolve generated idx names
		const dbConfig = dbConfigSchema.parse({
			tables: {
				oldTable: userInitial,
				newTable: {
					...userInitial,
					indexes: [
						{ on: ['name', 'age'], unique: false },
						{ on: ['email'], unique: true },
					],
				},
			},
		});

		const { queries } = await getTableChangeQueries({
			tableName: 'user',
			oldTable: dbConfig.tables.oldTable,
			newTable: dbConfig.tables.newTable,
		});

		expect(queries).to.deep.equal([
			'CREATE INDEX "newTable_age_name_idx" ON "user" ("age", "name")',
			'CREATE UNIQUE INDEX "newTable_email_idx" ON "user" ("email")',
		]);
	});

	it('adds indexes', async () => {
		const dbConfig = dbConfigSchema.parse({
			tables: {
				oldTable: userInitial,
				newTable: {
					...userInitial,
					indexes: [
						{ on: ['name'], unique: false, name: 'nameIdx' },
						{ on: ['email'], unique: true, name: 'emailIdx' },
					],
				},
			},
		});

		const { queries } = await getTableChangeQueries({
			tableName: 'user',
			oldTable: dbConfig.tables.oldTable,
			newTable: dbConfig.tables.newTable,
		});

		expect(queries).to.deep.equal([
			'CREATE INDEX "nameIdx" ON "user" ("name")',
			'CREATE UNIQUE INDEX "emailIdx" ON "user" ("email")',
		]);
	});

	it('drops indexes', async () => {
		const dbConfig = dbConfigSchema.parse({
			tables: {
				oldTable: {
					...userInitial,
					indexes: [
						{ on: ['name'], unique: false, name: 'nameIdx' },
						{ on: ['email'], unique: true, name: 'emailIdx' },
					],
				},
				newTable: {
					...userInitial,
					indexes: {},
				},
			},
		});

		const { queries } = await getTableChangeQueries({
			tableName: 'user',
			oldTable: dbConfig.tables.oldTable,
			newTable: dbConfig.tables.newTable,
		});

		expect(queries).to.deep.equal(['DROP INDEX "nameIdx"', 'DROP INDEX "emailIdx"']);
	});

	it('generates index names with consistent column ordering', async () => {
		const initial = dbConfigSchema.parse({
			tables: {
				user: {
					...userInitial,
					indexes: [
						{ on: ['email'], unique: true },
						{ on: ['name', 'age'], unique: false },
					],
				},
			},
		});

		const final = dbConfigSchema.parse({
			tables: {
				user: {
					...userInitial,
					indexes: [
						// flip columns
						{ on: ['age', 'name'], unique: false },
						// flip index order
						{ on: ['email'], unique: true },
					],
				},
			},
		});

		const { queries } = await getTableChangeQueries({
			tableName: 'user',
			oldTable: initial.tables.user,
			newTable: final.tables.user,
		});

		expect(queries).to.be.empty;
	});

	it('drops and recreates modified indexes', async () => {
		const dbConfig = dbConfigSchema.parse({
			tables: {
				oldTable: {
					...userInitial,
					indexes: [
						{ unique: false, on: ['name'], name: 'nameIdx' },
						{ unique: true, on: ['email'], name: 'emailIdx' },
					],
				},
				newTable: {
					...userInitial,
					indexes: [
						{ unique: true, on: ['name'], name: 'nameIdx' },
						{ on: ['email'], name: 'emailIdx' },
					],
				},
			},
		});

		const { queries } = await getTableChangeQueries({
			tableName: 'user',
			oldTable: dbConfig.tables.oldTable,
			newTable: dbConfig.tables.newTable,
		});

		expect(queries).to.deep.equal([
			'DROP INDEX "nameIdx"',
			'DROP INDEX "emailIdx"',
			'CREATE UNIQUE INDEX "nameIdx" ON "user" ("name")',
			'CREATE INDEX "emailIdx" ON "user" ("email")',
		]);
	});

	describe('legacy object config', () => {
		it('adds indexes', async () => {
			/** @type {import('../../dist/core/types.js').DBTable} */
			const userFinal = {
				...userInitial,
				indexes: {
					nameIdx: { on: ['name'], unique: false },
					emailIdx: { on: ['email'], unique: true },
				},
			};

			const { queries } = await getTableChangeQueries({
				tableName: 'user',
				oldTable: userInitial,
				newTable: userFinal,
			});

			expect(queries).to.deep.equal([
				'CREATE INDEX "nameIdx" ON "user" ("name")',
				'CREATE UNIQUE INDEX "emailIdx" ON "user" ("email")',
			]);
		});

		it('drops indexes', async () => {
			/** @type {import('../../dist/core/types.js').DBTable} */
			const initial = {
				...userInitial,
				indexes: {
					nameIdx: { on: ['name'], unique: false },
					emailIdx: { on: ['email'], unique: true },
				},
			};

			/** @type {import('../../dist/core/types.js').DBTable} */
			const final = {
				...userInitial,
				indexes: {},
			};

			const { queries } = await getTableChangeQueries({
				tableName: 'user',
				oldTable: initial,
				newTable: final,
			});

			expect(queries).to.deep.equal(['DROP INDEX "nameIdx"', 'DROP INDEX "emailIdx"']);
		});

		it('drops and recreates modified indexes', async () => {
			/** @type {import('../../dist/core/types.js').DBTable} */
			const initial = {
				...userInitial,
				indexes: {
					nameIdx: { on: ['name'], unique: false },
					emailIdx: { on: ['email'], unique: true },
				},
			};

			/** @type {import('../../dist/core/types.js').DBTable} */
			const final = {
				...userInitial,
				indexes: {
					nameIdx: { on: ['name'], unique: true },
					emailIdx: { on: ['email'] },
				},
			};

			const { queries } = await getTableChangeQueries({
				tableName: 'user',
				oldTable: initial,
				newTable: final,
			});

			expect(queries).to.deep.equal([
				'DROP INDEX "nameIdx"',
				'DROP INDEX "emailIdx"',
				'CREATE UNIQUE INDEX "nameIdx" ON "user" ("name")',
				'CREATE INDEX "emailIdx" ON "user" ("email")',
			]);
		});
	});
});

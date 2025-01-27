import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getTableChangeQueries } from '../../dist/core/cli/migration-queries.js';
import { tablesSchema } from '../../dist/core/schemas.js';
import { column, defineTable } from '../../dist/runtime/virtual.js';

const BaseUser = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		name: column.text(),
		age: column.number(),
		email: column.text({ unique: true }),
		mi: column.text({ optional: true }),
	},
});

const BaseSentBox = defineTable({
	columns: {
		to: column.number(),
		toName: column.text(),
		subject: column.text(),
		body: column.text(),
	},
});

/**
 * @typedef {import('../../dist/core/types.js').DBTable} DBTable
 * @param {{ User: DBTable, SentBox: DBTable }} params
 * @returns
 */
function resolveReferences(
	{ User = BaseUser, SentBox = BaseSentBox } = {
		User: BaseUser,
		SentBox: BaseSentBox,
	},
) {
	return tablesSchema.parse({ User, SentBox });
}

function userChangeQueries(oldTable, newTable) {
	return getTableChangeQueries({
		tableName: 'User',
		oldTable,
		newTable,
	});
}

describe('reference queries', () => {
	it('adds references with lossless table recreate', async () => {
		const { SentBox: Initial } = resolveReferences();
		const { SentBox: Final } = resolveReferences({
			SentBox: defineTable({
				columns: {
					...BaseSentBox.columns,
					to: column.number({ references: () => BaseUser.columns.id }),
				},
			}),
		});

		const { queries } = await userChangeQueries(Initial, Final);

		assert.equal(queries[0] !== undefined, true);
		const tempTableName = getTempTableName(queries[0]);
		assert.notEqual(typeof tempTableName, 'undefined');

		assert.deepEqual(queries, [
			`CREATE TABLE \"${tempTableName}\" (_id INTEGER PRIMARY KEY, \"to\" integer NOT NULL REFERENCES \"User\" (\"id\"), \"toName\" text NOT NULL, \"subject\" text NOT NULL, \"body\" text NOT NULL)`,
			`INSERT INTO \"${tempTableName}\" (\"_id\", \"to\", \"toName\", \"subject\", \"body\") SELECT \"_id\", \"to\", \"toName\", \"subject\", \"body\" FROM \"User\"`,
			'DROP TABLE "User"',
			`ALTER TABLE \"${tempTableName}\" RENAME TO \"User\"`,
		]);
	});

	it('removes references with lossless table recreate', async () => {
		const { SentBox: Initial } = resolveReferences({
			SentBox: defineTable({
				columns: {
					...BaseSentBox.columns,
					to: column.number({ references: () => BaseUser.columns.id }),
				},
			}),
		});
		const { SentBox: Final } = resolveReferences();

		const { queries } = await userChangeQueries(Initial, Final);

		assert.equal(queries[0] !== undefined, true);
		const tempTableName = getTempTableName(queries[0]);
		assert.notEqual(typeof tempTableName, 'undefined');

		assert.deepEqual(queries, [
			`CREATE TABLE \"${tempTableName}\" (_id INTEGER PRIMARY KEY, \"to\" integer NOT NULL, \"toName\" text NOT NULL, \"subject\" text NOT NULL, \"body\" text NOT NULL)`,
			`INSERT INTO \"${tempTableName}\" (\"_id\", \"to\", \"toName\", \"subject\", \"body\") SELECT \"_id\", \"to\", \"toName\", \"subject\", \"body\" FROM \"User\"`,
			'DROP TABLE "User"',
			`ALTER TABLE \"${tempTableName}\" RENAME TO \"User\"`,
		]);
	});

	it('does not use ADD COLUMN when adding optional column with reference', async () => {
		const { SentBox: Initial } = resolveReferences();
		const { SentBox: Final } = resolveReferences({
			SentBox: defineTable({
				columns: {
					...BaseSentBox.columns,
					from: column.number({ references: () => BaseUser.columns.id, optional: true }),
				},
			}),
		});

		const { queries } = await userChangeQueries(Initial, Final);
		assert.equal(queries[0] !== undefined, true);
		const tempTableName = getTempTableName(queries[0]);

		assert.deepEqual(queries, [
			`CREATE TABLE \"${tempTableName}\" (_id INTEGER PRIMARY KEY, \"to\" integer NOT NULL, \"toName\" text NOT NULL, \"subject\" text NOT NULL, \"body\" text NOT NULL, \"from\" integer REFERENCES \"User\" (\"id\"))`,
			`INSERT INTO \"${tempTableName}\" (\"_id\", \"to\", \"toName\", \"subject\", \"body\") SELECT \"_id\", \"to\", \"toName\", \"subject\", \"body\" FROM \"User\"`,
			'DROP TABLE "User"',
			`ALTER TABLE \"${tempTableName}\" RENAME TO \"User\"`,
		]);
	});

	it('adds and updates foreign key with lossless table recreate', async () => {
		const { SentBox: InitialWithoutFK } = resolveReferences();
		const { SentBox: InitialWithDifferentFK } = resolveReferences({
			SentBox: defineTable({
				...BaseSentBox,
				foreignKeys: [{ columns: ['to'], references: () => [BaseUser.columns.id] }],
			}),
		});
		const { SentBox: Final } = resolveReferences({
			SentBox: defineTable({
				...BaseSentBox,
				foreignKeys: [
					{
						columns: ['to', 'toName'],
						references: () => [BaseUser.columns.id, BaseUser.columns.name],
					},
				],
			}),
		});

		const expected = (tempTableName) => [
			`CREATE TABLE \"${tempTableName}\" (_id INTEGER PRIMARY KEY, \"to\" integer NOT NULL, \"toName\" text NOT NULL, \"subject\" text NOT NULL, \"body\" text NOT NULL, FOREIGN KEY (\"to\", \"toName\") REFERENCES \"User\"(\"id\", \"name\"))`,
			`INSERT INTO \"${tempTableName}\" (\"_id\", \"to\", \"toName\", \"subject\", \"body\") SELECT \"_id\", \"to\", \"toName\", \"subject\", \"body\" FROM \"User\"`,
			'DROP TABLE "User"',
			`ALTER TABLE \"${tempTableName}\" RENAME TO \"User\"`,
		];

		const addedForeignKey = await userChangeQueries(InitialWithoutFK, Final);
		const updatedForeignKey = await userChangeQueries(InitialWithDifferentFK, Final);

		assert.notEqual(typeof addedForeignKey.queries[0], 'undefined');
		assert.notEqual(typeof updatedForeignKey.queries[0], 'undefined');
		assert.deepEqual(
			addedForeignKey.queries,
			expected(getTempTableName(addedForeignKey.queries[0])),
		);

		assert.deepEqual(
			updatedForeignKey.queries,
			expected(getTempTableName(updatedForeignKey.queries[0])),
		);
	});
});

/** @param {string} query */
function getTempTableName(query) {
	return /User_[a-z\d]+/.exec(query)?.[0];
}

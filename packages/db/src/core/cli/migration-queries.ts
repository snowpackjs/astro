import { stripVTControlCharacters } from 'node:util';
import deepDiff from 'deep-diff';
import { sql } from 'drizzle-orm';
import { SQLiteAsyncDialect } from 'drizzle-orm/sqlite-core';
import * as color from 'kleur/colors';
import { customAlphabet } from 'nanoid';
import { hasPrimaryKey } from '../../runtime/index.js';
import { createRemoteDatabaseClient } from '../../runtime/index.js';
import { isSerializedSQL } from '../../runtime/types.js';
import { isDbError, safeFetch } from '../../runtime/utils.js';
import { MIGRATION_VERSION } from '../consts.js';
import { RENAME_COLUMN_ERROR, RENAME_TABLE_ERROR } from '../errors.js';
import {
	getCreateIndexQueries,
	getCreateTableQuery,
	getDropTableIfExistsQuery,
	getModifiers,
	getReferencesConfig,
	hasDefault,
	schemaTypeToSqlType,
} from '../queries.js';
import { columnSchema } from '../schemas.js';
import type {
	BooleanColumn,
	ColumnType,
	DBColumn,
	DBColumns,
	DBConfig,
	DBSnapshot,
	DateColumn,
	JsonColumn,
	NumberColumn,
	ResolvedDBTable,
	ResolvedDBTables,
	ResolvedIndexes,
	TextColumn,
} from '../types.js';
import type { RemoteDatabaseInfo, Result } from '../utils.js';

const sqlite = new SQLiteAsyncDialect();
const genTempTableName = customAlphabet('abcdefghijklmnopqrstuvwxyz', 10);

export async function getMigrationQueries({
	oldSnapshot,
	newSnapshot,
	reset = false,
}: {
	oldSnapshot: DBSnapshot;
	newSnapshot: DBSnapshot;
	reset?: boolean;
}): Promise<{ queries: string[]; confirmations: string[] }> {
	const queries: string[] = [];
	const confirmations: string[] = [];

	// When doing a reset, first create DROP TABLE statements, then treat everything
	// else as creation.
	if (reset) {
		const currentSnapshot = oldSnapshot;
		oldSnapshot = createEmptySnapshot();
		queries.push(...getDropTableQueriesForSnapshot(currentSnapshot));
	}

	const addedTables = getAddedTables(oldSnapshot, newSnapshot);
	const droppedTables = getDroppedTables(oldSnapshot, newSnapshot);
	const notDeprecatedDroppedTables = Object.fromEntries(
		Object.entries(droppedTables).filter(([, table]) => !table.deprecated),
	);
	if (!isEmpty(addedTables) && !isEmpty(notDeprecatedDroppedTables)) {
		const oldTable = Object.keys(notDeprecatedDroppedTables)[0];
		const newTable = Object.keys(addedTables)[0];
		throw new Error(RENAME_TABLE_ERROR(oldTable, newTable));
	}

	for (const [tableName, table] of Object.entries(addedTables)) {
		queries.push(getCreateTableQuery(tableName, table));
		queries.push(...getCreateIndexQueries(tableName, table));
	}

	for (const [tableName] of Object.entries(droppedTables)) {
		const dropQuery = `DROP TABLE ${sqlite.escapeName(tableName)}`;
		queries.push(dropQuery);
	}

	for (const [tableName, newTable] of Object.entries(newSnapshot.schema)) {
		const oldTable = oldSnapshot.schema[tableName];
		if (!oldTable) continue;
		const addedColumns = getAdded(oldTable.columns, newTable.columns);
		const droppedColumns = getDropped(oldTable.columns, newTable.columns);
		const notDeprecatedDroppedColumns = Object.fromEntries(
			Object.entries(droppedColumns).filter(([, col]) => !col.schema.deprecated),
		);
		if (!isEmpty(addedColumns) && !isEmpty(notDeprecatedDroppedColumns)) {
			throw new Error(
				RENAME_COLUMN_ERROR(
					`${tableName}.${Object.keys(addedColumns)[0]}`,
					`${tableName}.${Object.keys(notDeprecatedDroppedColumns)[0]}`,
				),
			);
		}
		const result = await getTableChangeQueries({
			tableName,
			oldTable,
			newTable,
		});
		queries.push(...result.queries);
		confirmations.push(...result.confirmations);
	}
	return { queries, confirmations };
}

export async function getTableChangeQueries({
	tableName,
	oldTable,
	newTable,
}: {
	tableName: string;
	oldTable: ResolvedDBTable;
	newTable: ResolvedDBTable;
}): Promise<{ queries: string[]; confirmations: string[] }> {
	const queries: string[] = [];
	const confirmations: string[] = [];
	const updated = getUpdatedColumns(oldTable.columns, newTable.columns);
	const added = getAdded(oldTable.columns, newTable.columns);
	const dropped = getDropped(oldTable.columns, newTable.columns);
	/** Any foreign key changes require a full table recreate */
	const hasForeignKeyChanges = Boolean(deepDiff(oldTable.foreignKeys, newTable.foreignKeys));

	if (!hasForeignKeyChanges && isEmpty(updated) && isEmpty(added) && isEmpty(dropped)) {
		return {
			queries: getChangeIndexQueries({
				tableName,
				oldIndexes: oldTable.indexes,
				newIndexes: newTable.indexes,
			}),
			confirmations,
		};
	}

	if (
		!hasForeignKeyChanges &&
		isEmpty(updated) &&
		Object.values(dropped).every(canAlterTableDropColumn) &&
		Object.values(added).every(canAlterTableAddColumn)
	) {
		queries.push(
			...getAlterTableQueries(tableName, added, dropped),
			...getChangeIndexQueries({
				tableName,
				oldIndexes: oldTable.indexes,
				newIndexes: newTable.indexes,
			}),
		);
		return { queries, confirmations };
	}

	const dataLossCheck = canRecreateTableWithoutDataLoss(added, updated);
	if (dataLossCheck.dataLoss) {
		const { reason, columnName } = dataLossCheck;
		const reasonMsgs: Record<DataLossReason, string> = {
			'added-required': `You added new required column '${color.bold(
				tableName + '.' + columnName,
			)}' with no default value.\n      This cannot be executed on an existing table.`,
			'updated-type': `Updating existing column ${color.bold(
				tableName + '.' + columnName,
			)} to a new type that cannot be handled automatically.`,
		};
		confirmations.push(reasonMsgs[reason]);
	}

	const primaryKeyExists = Object.entries(newTable.columns).find(([, column]) =>
		hasPrimaryKey(column),
	);
	const droppedPrimaryKey = Object.entries(dropped).find(([, column]) => hasPrimaryKey(column));

	const recreateTableQueries = getRecreateTableQueries({
		tableName,
		newTable,
		added,
		hasDataLoss: dataLossCheck.dataLoss,
		migrateHiddenPrimaryKey: !primaryKeyExists && !droppedPrimaryKey,
	});
	queries.push(...recreateTableQueries, ...getCreateIndexQueries(tableName, newTable));
	return { queries, confirmations };
}

function getChangeIndexQueries({
	tableName,
	oldIndexes = {},
	newIndexes = {},
}: {
	tableName: string;
	oldIndexes?: ResolvedIndexes;
	newIndexes?: ResolvedIndexes;
}) {
	const added = getAdded(oldIndexes, newIndexes);
	const dropped = getDropped(oldIndexes, newIndexes);
	const updated = getUpdated(oldIndexes, newIndexes);

	Object.assign(dropped, updated);
	Object.assign(added, updated);

	const queries: string[] = [];
	for (const indexName of Object.keys(dropped)) {
		const dropQuery = `DROP INDEX ${sqlite.escapeName(indexName)}`;
		queries.push(dropQuery);
	}
	queries.push(...getCreateIndexQueries(tableName, { indexes: added }));
	return queries;
}

function getAddedTables(oldTables: DBSnapshot, newTables: DBSnapshot): ResolvedDBTables {
	const added: ResolvedDBTables = {};
	for (const [key, newTable] of Object.entries(newTables.schema)) {
		if (!(key in oldTables.schema)) added[key] = newTable;
	}
	return added;
}

function getDroppedTables(oldTables: DBSnapshot, newTables: DBSnapshot): ResolvedDBTables {
	const dropped: ResolvedDBTables = {};
	for (const [key, oldTable] of Object.entries(oldTables.schema)) {
		if (!(key in newTables.schema)) dropped[key] = oldTable;
	}
	return dropped;
}

/**
 * Get ALTER TABLE queries to update the table schema. Assumes all added and dropped columns pass
 * `canUseAlterTableAddColumn` and `canAlterTableDropColumn` checks!
 */
function getAlterTableQueries(
	unescTableName: string,
	added: DBColumns,
	dropped: DBColumns,
): string[] {
	const queries: string[] = [];
	const tableName = sqlite.escapeName(unescTableName);

	for (const [unescColumnName, column] of Object.entries(added)) {
		const columnName = sqlite.escapeName(unescColumnName);
		const type = schemaTypeToSqlType(column.type);
		const q = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${type}${getModifiers(
			columnName,
			column,
		)}`;
		queries.push(q);
	}

	for (const unescColumnName of Object.keys(dropped)) {
		const columnName = sqlite.escapeName(unescColumnName);
		const q = `ALTER TABLE ${tableName} DROP COLUMN ${columnName}`;
		queries.push(q);
	}

	return queries;
}

function getRecreateTableQueries({
	tableName: unescTableName,
	newTable,
	added,
	hasDataLoss,
	migrateHiddenPrimaryKey,
}: {
	tableName: string;
	newTable: ResolvedDBTable;
	added: Record<string, DBColumn>;
	hasDataLoss: boolean;
	migrateHiddenPrimaryKey: boolean;
}): string[] {
	const unescTempName = `${unescTableName}_${genTempTableName()}`;
	const tempName = sqlite.escapeName(unescTempName);
	const tableName = sqlite.escapeName(unescTableName);

	if (hasDataLoss) {
		return [`DROP TABLE ${tableName}`, getCreateTableQuery(unescTableName, newTable)];
	}
	const newColumns = [...Object.keys(newTable.columns)];
	if (migrateHiddenPrimaryKey) {
		newColumns.unshift('_id');
	}
	const escapedColumns = newColumns
		.filter((i) => !(i in added))
		.map((c) => sqlite.escapeName(c))
		.join(', ');

	return [
		getCreateTableQuery(unescTempName, newTable),
		`INSERT INTO ${tempName} (${escapedColumns}) SELECT ${escapedColumns} FROM ${tableName}`,
		`DROP TABLE ${tableName}`,
		`ALTER TABLE ${tempName} RENAME TO ${tableName}`,
	];
}

function isEmpty(obj: Record<string, unknown>) {
	return Object.keys(obj).length === 0;
}

/**
 * ADD COLUMN is preferred for O(1) table updates, but is only supported for _some_ column
 * definitions.
 *
 * @see https://www.sqlite.org/lang_altertable.html#alter_table_add_column
 */
function canAlterTableAddColumn(column: DBColumn) {
	if (column.schema.unique) return false;
	if (hasRuntimeDefault(column)) return false;
	if (!column.schema.optional && !hasDefault(column)) return false;
	if (hasPrimaryKey(column)) return false;
	if (getReferencesConfig(column)) return false;
	return true;
}

function canAlterTableDropColumn(column: DBColumn) {
	if (column.schema.unique) return false;
	if (hasPrimaryKey(column)) return false;
	return true;
}

type DataLossReason = 'added-required' | 'updated-type';
type DataLossResponse =
	| { dataLoss: false }
	| { dataLoss: true; columnName: string; reason: DataLossReason };

function canRecreateTableWithoutDataLoss(
	added: DBColumns,
	updated: UpdatedColumns,
): DataLossResponse {
	for (const [columnName, a] of Object.entries(added)) {
		if (hasPrimaryKey(a) && a.type !== 'number' && !hasDefault(a)) {
			return { dataLoss: true, columnName, reason: 'added-required' };
		}
		if (!a.schema.optional && !hasDefault(a)) {
			return { dataLoss: true, columnName, reason: 'added-required' };
		}
	}
	for (const [columnName, u] of Object.entries(updated)) {
		if (u.old.type !== u.new.type && !canChangeTypeWithoutQuery(u.old, u.new)) {
			return { dataLoss: true, columnName, reason: 'updated-type' };
		}
	}
	return { dataLoss: false };
}

function getAdded<T>(oldObj: Record<string, T>, newObj: Record<string, T>) {
	const added: Record<string, T> = {};
	for (const [key, value] of Object.entries(newObj)) {
		if (!(key in oldObj)) added[key] = value;
	}
	return added;
}

function getDropped<T>(oldObj: Record<string, T>, newObj: Record<string, T>) {
	const dropped: Record<string, T> = {};
	for (const [key, value] of Object.entries(oldObj)) {
		if (!(key in newObj)) dropped[key] = value;
	}
	return dropped;
}

function getUpdated<T>(oldObj: Record<string, T>, newObj: Record<string, T>) {
	const updated: Record<string, T> = {};
	for (const [key, value] of Object.entries(newObj)) {
		const oldValue = oldObj[key];
		if (!oldValue) continue;
		if (deepDiff(oldValue, value)) updated[key] = value;
	}
	return updated;
}

type UpdatedColumns = Record<string, { old: DBColumn; new: DBColumn }>;

function getUpdatedColumns(oldColumns: DBColumns, newColumns: DBColumns): UpdatedColumns {
	const updated: UpdatedColumns = {};
	for (const [key, newColumn] of Object.entries(newColumns)) {
		let oldColumn = oldColumns[key];
		if (!oldColumn) continue;

		if (oldColumn.type !== newColumn.type && canChangeTypeWithoutQuery(oldColumn, newColumn)) {
			// If we can safely change the type without a query,
			// try parsing the old schema as the new schema.
			// This lets us diff the columns as if they were the same type.
			const asNewColumn = columnSchema.safeParse({
				type: newColumn.type,
				schema: oldColumn.schema,
			});
			if (asNewColumn.success) {
				oldColumn = asNewColumn.data;
			}
			// If parsing fails, move on to the standard diff.
		}

		const diff = deepDiff(oldColumn, newColumn);

		if (diff) {
			updated[key] = { old: oldColumn, new: newColumn };
		}
	}
	return updated;
}
const typeChangesWithoutQuery: Array<{ from: ColumnType; to: ColumnType }> = [
	{ from: 'boolean', to: 'number' },
	{ from: 'date', to: 'text' },
	{ from: 'json', to: 'text' },
];

function canChangeTypeWithoutQuery(oldColumn: DBColumn, newColumn: DBColumn) {
	return typeChangesWithoutQuery.some(
		({ from, to }) => oldColumn.type === from && newColumn.type === to,
	);
}

// Using `DBColumn` will not narrow `default` based on the column `type`
// Handle each column separately
type WithDefaultDefined<T extends DBColumn> = T & Required<Pick<T['schema'], 'default'>>;
type DBColumnWithDefault =
	| WithDefaultDefined<TextColumn>
	| WithDefaultDefined<DateColumn>
	| WithDefaultDefined<NumberColumn>
	| WithDefaultDefined<BooleanColumn>
	| WithDefaultDefined<JsonColumn>;

function hasRuntimeDefault(column: DBColumn): column is DBColumnWithDefault {
	return !!(column.schema.default && isSerializedSQL(column.schema.default));
}

export function getProductionCurrentSnapshot(options: {
	dbInfo: RemoteDatabaseInfo;
	appToken: string;
}): Promise<DBSnapshot | undefined> {
	return options.dbInfo.type === 'studio'
		? getStudioCurrentSnapshot(options.appToken, options.dbInfo.url)
		: getDbCurrentSnapshot(options.appToken, options.dbInfo.url);
}

async function getDbCurrentSnapshot(
	appToken: string,
	remoteUrl: string,
): Promise<DBSnapshot | undefined> {
	const client = createRemoteDatabaseClient({
		dbType: 'libsql',
		appToken,
		remoteUrl,
	});

	try {
		const res = await client.get<{ snapshot: string }>(
			// Latest snapshot
			sql`select snapshot from _astro_db_snapshot order by id desc limit 1;`,
		);

		return JSON.parse(res.snapshot);
	} catch (error) {
		// Don't handle errors that are not from libSQL
		if (
			isDbError(error) &&
			// If the schema was never pushed to the database yet the table won't exist.
			// Treat a missing snapshot table as an empty table.

			// When connecting to a remote database in that condition
			// the query will fail with the following error code and message.
			((error.code === 'SQLITE_UNKNOWN' &&
				error.message === 'SQLITE_UNKNOWN: SQLite error: no such table: _astro_db_snapshot') ||
				// When connecting to a local or in-memory database that does not have a snapshot table yet
				// the query will fail with the following error code and message.
				(error.code === 'SQLITE_ERROR' &&
					error.message === 'SQLITE_ERROR: no such table: _astro_db_snapshot'))
		) {
			return;
		}

		throw error;
	}
}

async function getStudioCurrentSnapshot(
	appToken: string,
	remoteUrl: string,
): Promise<DBSnapshot | undefined> {
	const url = new URL('/db/schema', remoteUrl);

	const response = await safeFetch(
		url,
		{
			method: 'POST',
			headers: new Headers({
				Authorization: `Bearer ${appToken}`,
			}),
		},
		async (res) => {
			console.error(`${url.toString()} failed: ${res.status} ${res.statusText}`);
			console.error(await res.text());
			throw new Error(`/db/schema fetch failed: ${res.status} ${res.statusText}`);
		},
	);

	const result = (await response.json()) as Result<DBSnapshot>;
	if (!result.success) {
		console.error(`${url.toString()} unsuccessful`);
		console.error(await response.text());
		throw new Error(`/db/schema fetch unsuccessful`);
	}
	return result.data;
}

function getDropTableQueriesForSnapshot(snapshot: DBSnapshot) {
	const queries = [];
	for (const tableName of Object.keys(snapshot.schema)) {
		const dropQuery = getDropTableIfExistsQuery(tableName);
		queries.unshift(dropQuery);
	}
	return queries;
}

export function createCurrentSnapshot({ tables = {} }: DBConfig): DBSnapshot {
	const schema = JSON.parse(JSON.stringify(tables));
	return { version: MIGRATION_VERSION, schema };
}

export function createEmptySnapshot(): DBSnapshot {
	return { version: MIGRATION_VERSION, schema: {} };
}

export function formatDataLossMessage(confirmations: string[], isColor = true): string {
	const messages = [];
	messages.push(color.red('✖ We found some schema changes that cannot be handled automatically:'));
	messages.push(``);
	messages.push(...confirmations.map((m, i) => color.red(`  (${i + 1}) `) + m));
	messages.push(``);
	messages.push(`To resolve, revert these changes or update your schema, and re-run the command.`);
	messages.push(
		`You may also run 'astro db push --force-reset' to ignore all warnings and force-push your local database schema to production instead. All data will be lost and the database will be reset.`,
	);
	let finalMessage = messages.join('\n');
	if (!isColor) {
		finalMessage = stripVTControlCharacters(finalMessage);
	}
	return finalMessage;
}

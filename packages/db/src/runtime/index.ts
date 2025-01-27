import { type ColumnBuilderBaseConfig, type ColumnDataType, sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import {
	type IndexBuilder,
	type SQLiteColumnBuilderBase,
	customType,
	index,
	integer,
	sqliteTable,
	text,
} from 'drizzle-orm/sqlite-core';
import type { DBColumn, DBTable } from '../core/types.js';
import { type SerializedSQL, isSerializedSQL } from './types.js';
import { pathToFileURL } from './utils.js';
export type Database = Omit<LibSQLDatabase, 'transaction'>;
export type { Table } from './types.js';
export { createRemoteDatabaseClient, createLocalDatabaseClient } from './db-client.js';

export function hasPrimaryKey(column: DBColumn) {
	return 'primaryKey' in column.schema && !!column.schema.primaryKey;
}

// Taken from:
// https://stackoverflow.com/questions/52869695/check-if-a-date-string-is-in-iso-and-utc-format
const isISODateString = (str: string) => /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str);

const dateType = customType<{ data: Date; driverData: string }>({
	dataType() {
		return 'text';
	},
	toDriver(value) {
		return value.toISOString();
	},
	fromDriver(value) {
		if (!isISODateString(value)) {
			// values saved using CURRENT_TIMESTAMP are not valid ISO strings
			// but *are* in UTC, so append the UTC zone.
			value += 'Z';
		}
		return new Date(value);
	},
});

const jsonType = customType<{ data: unknown; driverData: string }>({
	dataType() {
		return 'text';
	},
	toDriver(value) {
		return JSON.stringify(value);
	},
	fromDriver(value) {
		return JSON.parse(value);
	},
});

type D1ColumnBuilder = SQLiteColumnBuilderBase<
	ColumnBuilderBaseConfig<ColumnDataType, string> & { data: unknown }
>;

export function asDrizzleTable(name: string, table: DBTable) {
	const columns: Record<string, D1ColumnBuilder> = {};
	if (!Object.entries(table.columns).some(([, column]) => hasPrimaryKey(column))) {
		columns['_id'] = integer('_id').primaryKey();
	}
	for (const [columnName, column] of Object.entries(table.columns)) {
		columns[columnName] = columnMapper(columnName, column);
	}
	const drizzleTable = sqliteTable(name, columns, (ormTable) => {
		const indexes: Record<string, IndexBuilder> = {};
		for (const [indexName, indexProps] of Object.entries(table.indexes ?? {})) {
			const onColNames = Array.isArray(indexProps.on) ? indexProps.on : [indexProps.on];
			const onCols = onColNames.map((colName) => ormTable[colName]);
			if (!atLeastOne(onCols)) continue;

			indexes[indexName] = index(indexName).on(...onCols);
		}
		return indexes;
	});
	return drizzleTable;
}

function atLeastOne<T>(arr: T[]): arr is [T, ...T[]] {
	return arr.length > 0;
}

function columnMapper(columnName: string, column: DBColumn) {
	let c: ReturnType<
		| typeof text
		| typeof integer
		| typeof jsonType
		| typeof dateType
		| typeof integer<string, 'boolean'>
	>;

	switch (column.type) {
		case 'text': {
			c = text(columnName);
			// Duplicate default logic across cases to preserve type inference.
			// No clean generic for every column builder.
			if (column.schema.default !== undefined)
				c = c.default(handleSerializedSQL(column.schema.default));
			if (column.schema.primaryKey === true) c = c.primaryKey();
			break;
		}
		case 'number': {
			c = integer(columnName);
			if (column.schema.default !== undefined)
				c = c.default(handleSerializedSQL(column.schema.default));
			if (column.schema.primaryKey === true) c = c.primaryKey();
			break;
		}
		case 'boolean': {
			c = integer(columnName, { mode: 'boolean' });
			if (column.schema.default !== undefined)
				c = c.default(handleSerializedSQL(column.schema.default));
			break;
		}
		case 'json':
			c = jsonType(columnName);
			if (column.schema.default !== undefined) c = c.default(column.schema.default);
			break;
		case 'date': {
			c = dateType(columnName);
			if (column.schema.default !== undefined) {
				const def = handleSerializedSQL(column.schema.default);
				c = c.default(typeof def === 'string' ? new Date(def) : def);
			}
			break;
		}
	}

	if (!column.schema.optional) c = c.notNull();
	if (column.schema.unique) c = c.unique();
	return c;
}

function handleSerializedSQL<T>(def: T | SerializedSQL) {
	if (isSerializedSQL(def)) {
		return sql.raw(def.sql);
	}
	return def;
}

export function normalizeDatabaseUrl(envDbUrl: string | undefined, defaultDbUrl: string): string {
	if (envDbUrl) {
		// This could be a file URL, or more likely a root-relative file path.
		// Convert it to a file URL.
		if (envDbUrl.startsWith('file://')) {
			return envDbUrl;
		}

		return new URL(envDbUrl, pathToFileURL(process.cwd()) + '/').toString();
	} else {
		// This is going to be a file URL always,
		return defaultDbUrl;
	}
}

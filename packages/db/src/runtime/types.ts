import type { ColumnBaseConfig, ColumnDataType } from 'drizzle-orm';
import type { SQLiteColumn, SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import type { ColumnsConfig, DBColumn, OutputColumnsConfig } from '../core/types.js';

type GeneratedConfig<T extends ColumnDataType = ColumnDataType> = Pick<
	ColumnBaseConfig<T, string>,
	'name' | 'tableName' | 'notNull' | 'hasDefault'
>;

export type AstroText<T extends GeneratedConfig<'string'>> = SQLiteColumn<
	T & {
		data: string;
		dataType: 'string';
		columnType: 'SQLiteText';
		driverParam: string;
		enumValues: never;
		baseColumn: never;
	}
>;

export type AstroDate<T extends GeneratedConfig<'custom'>> = SQLiteColumn<
	T & {
		data: Date;
		dataType: 'custom';
		columnType: 'SQLiteCustomColumn';
		driverParam: string;
		enumValues: never;
		baseColumn: never;
	}
>;

export type AstroBoolean<T extends GeneratedConfig<'boolean'>> = SQLiteColumn<
	T & {
		data: boolean;
		dataType: 'boolean';
		columnType: 'SQLiteBoolean';
		driverParam: number;
		enumValues: never;
		baseColumn: never;
	}
>;

export type AstroNumber<T extends GeneratedConfig<'number'>> = SQLiteColumn<
	T & {
		data: number;
		dataType: 'number';
		columnType: 'SQLiteInteger';
		driverParam: number;
		enumValues: never;
		baseColumn: never;
	}
>;

export type AstroJson<T extends GeneratedConfig<'custom'>> = SQLiteColumn<
	T & {
		data: unknown;
		dataType: 'custom';
		columnType: 'SQLiteCustomColumn';
		driverParam: string;
		enumValues: never;
		baseColumn: never;
	}
>;

export type Column<T extends DBColumn['type'], S extends GeneratedConfig> = T extends 'boolean'
	? AstroBoolean<S>
	: T extends 'number'
		? AstroNumber<S>
		: T extends 'text'
			? AstroText<S>
			: T extends 'date'
				? AstroDate<S>
				: T extends 'json'
					? AstroJson<S>
					: never;

export type Table<
	TTableName extends string,
	TColumns extends OutputColumnsConfig | ColumnsConfig,
> = SQLiteTableWithColumns<{
	name: TTableName;
	schema: undefined;
	dialect: 'sqlite';
	columns: {
		[K in Extract<keyof TColumns, string>]: Column<
			TColumns[K]['type'],
			{
				tableName: TTableName;
				name: K;
				hasDefault: TColumns[K]['schema'] extends { default: NonNullable<unknown> }
					? true
					: TColumns[K]['schema'] extends { primaryKey: true }
						? true
						: false;
				notNull: TColumns[K]['schema']['optional'] extends true ? false : true;
			}
		>;
	};
}>;

export const SERIALIZED_SQL_KEY = '__serializedSQL';
export type SerializedSQL = {
	[SERIALIZED_SQL_KEY]: true;
	sql: string;
};

export function isSerializedSQL(value: any): value is SerializedSQL {
	return typeof value === 'object' && value !== null && SERIALIZED_SQL_KEY in value;
}

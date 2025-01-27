import type { z } from 'zod';
import type {
	MaybeArray,
	booleanColumnSchema,
	columnSchema,
	columnsSchema,
	dateColumnSchema,
	dbConfigSchema,
	indexSchema,
	jsonColumnSchema,
	numberColumnOptsSchema,
	numberColumnSchema,
	referenceableColumnSchema,
	resolvedIndexSchema,
	tableSchema,
	textColumnOptsSchema,
	textColumnSchema,
} from './schemas.js';

export type ResolvedIndexes = z.output<typeof dbConfigSchema>['tables'][string]['indexes'];
export type BooleanColumn = z.infer<typeof booleanColumnSchema>;
export type BooleanColumnInput = z.input<typeof booleanColumnSchema>;
export type NumberColumn = z.infer<typeof numberColumnSchema>;
export type NumberColumnInput = z.input<typeof numberColumnSchema>;
export type TextColumn = z.infer<typeof textColumnSchema>;
export type TextColumnInput = z.input<typeof textColumnSchema>;
export type DateColumn = z.infer<typeof dateColumnSchema>;
export type DateColumnInput = z.input<typeof dateColumnSchema>;
export type JsonColumn = z.infer<typeof jsonColumnSchema>;
export type JsonColumnInput = z.input<typeof jsonColumnSchema>;

export type ColumnType =
	| BooleanColumn['type']
	| NumberColumn['type']
	| TextColumn['type']
	| DateColumn['type']
	| JsonColumn['type'];

export type DBColumn = z.infer<typeof columnSchema>;
export type DBColumnInput =
	| DateColumnInput
	| BooleanColumnInput
	| NumberColumnInput
	| TextColumnInput
	| JsonColumnInput;
export type DBColumns = z.infer<typeof columnsSchema>;
export type DBTable = z.infer<typeof tableSchema>;
export type DBTables = Record<string, DBTable>;
export type ResolvedDBTables = z.output<typeof dbConfigSchema>['tables'];
export type ResolvedDBTable = z.output<typeof dbConfigSchema>['tables'][string];
export type DBSnapshot = {
	schema: Record<string, ResolvedDBTable>;
	version: string;
};

export type DBConfigInput = z.input<typeof dbConfigSchema>;
export type DBConfig = z.infer<typeof dbConfigSchema>;

export type ColumnsConfig = z.input<typeof tableSchema>['columns'];
export type OutputColumnsConfig = z.output<typeof tableSchema>['columns'];

export interface TableConfig<TColumns extends ColumnsConfig = ColumnsConfig>
	// use `extends` to ensure types line up with zod,
	// only adding generics for type completions.
	extends Pick<z.input<typeof tableSchema>, 'columns' | 'indexes' | 'foreignKeys'> {
	columns: TColumns;
	foreignKeys?: Array<{
		columns: MaybeArray<Extract<keyof TColumns, string>>;
		references: () => MaybeArray<z.input<typeof referenceableColumnSchema>>;
	}>;
	indexes?: Array<IndexConfig<TColumns>> | Record<string, LegacyIndexConfig<TColumns>>;
	deprecated?: boolean;
}

interface IndexConfig<TColumns extends ColumnsConfig> extends z.input<typeof indexSchema> {
	on: MaybeArray<Extract<keyof TColumns, string>>;
}

/** @deprecated */
interface LegacyIndexConfig<TColumns extends ColumnsConfig>
	extends z.input<typeof resolvedIndexSchema> {
	on: MaybeArray<Extract<keyof TColumns, string>>;
}

// We cannot use `Omit<NumberColumn | TextColumn, 'type'>`,
// since Omit collapses our union type on primary key.
export type NumberColumnOpts = z.input<typeof numberColumnOptsSchema>;
export type TextColumnOpts = z.input<typeof textColumnOptsSchema>;

declare global {
	// eslint-disable-next-line  @typescript-eslint/no-namespace
	namespace Astro {
		export interface IntegrationHooks {
			'astro:db:setup'?: (options: {
				extendDb: (options: {
					configEntrypoint?: URL | string;
					seedEntrypoint?: URL | string;
				}) => void;
			}) => void | Promise<void>;
		}
	}
}

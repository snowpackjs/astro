import { SQL } from 'drizzle-orm';
import { SQLiteAsyncDialect } from 'drizzle-orm/sqlite-core';
import { type ZodTypeDef, z } from 'zod';
import { SERIALIZED_SQL_KEY, type SerializedSQL } from '../runtime/types.js';
import { errorMap } from './integration/error-map.js';
import type { NumberColumn, TextColumn } from './types.js';
import { mapObject } from './utils.js';

export type MaybeArray<T> = T | T[];

// Transform to serializable object for migration files
const sqlite = new SQLiteAsyncDialect();

const sqlSchema = z.instanceof(SQL<any>).transform(
	(sqlObj): SerializedSQL => ({
		[SERIALIZED_SQL_KEY]: true,
		sql: sqlite.sqlToQuery(sqlObj).sql,
	}),
);

const baseColumnSchema = z.object({
	label: z.string().optional(),
	optional: z.boolean().optional().default(false),
	unique: z.boolean().optional().default(false),
	deprecated: z.boolean().optional().default(false),

	// Defined when `defineDb()` is called to resolve `references`
	name: z.string().optional(),
	// TODO: Update to `table`. Will need migration file version change
	collection: z.string().optional(),
});

export const booleanColumnSchema = z.object({
	type: z.literal('boolean'),
	schema: baseColumnSchema.extend({
		default: z.union([z.boolean(), sqlSchema]).optional(),
	}),
});

const numberColumnBaseSchema = baseColumnSchema.omit({ optional: true }).and(
	z.union([
		z.object({
			primaryKey: z.literal(false).optional().default(false),
			optional: baseColumnSchema.shape.optional,
			default: z.union([z.number(), sqlSchema]).optional(),
		}),
		z.object({
			// `integer primary key` uses ROWID as the default value.
			// `optional` and `default` do not have an effect,
			// so disable these config options for primary keys.
			primaryKey: z.literal(true),
			optional: z.literal(false).optional(),
			default: z.literal(undefined).optional(),
		}),
	]),
);

export const numberColumnOptsSchema: z.ZodType<
	z.infer<typeof numberColumnBaseSchema> & {
		// ReferenceableColumn creates a circular type. Define ZodType to resolve.
		references?: NumberColumn;
	},
	ZodTypeDef,
	z.input<typeof numberColumnBaseSchema> & {
		references?: () => z.input<typeof numberColumnSchema>;
	}
> = numberColumnBaseSchema.and(
	z.object({
		references: z
			.function()
			.returns(z.lazy(() => numberColumnSchema))
			.optional()
			.transform((fn) => fn?.()),
	}),
);

export const numberColumnSchema = z.object({
	type: z.literal('number'),
	schema: numberColumnOptsSchema,
});

const textColumnBaseSchema = baseColumnSchema
	.omit({ optional: true })
	.extend({
		default: z.union([z.string(), sqlSchema]).optional(),
		multiline: z.boolean().optional(),
	})
	.and(
		z.union([
			z.object({
				primaryKey: z.literal(false).optional().default(false),
				optional: baseColumnSchema.shape.optional,
			}),
			z.object({
				// text primary key allows NULL values.
				// NULL values bypass unique checks, which could
				// lead to duplicate URLs per record in Astro Studio.
				// disable `optional` for primary keys.
				primaryKey: z.literal(true),
				optional: z.literal(false).optional(),
			}),
		]),
	);

export const textColumnOptsSchema: z.ZodType<
	z.infer<typeof textColumnBaseSchema> & {
		// ReferenceableColumn creates a circular type. Define ZodType to resolve.
		references?: TextColumn;
	},
	ZodTypeDef,
	z.input<typeof textColumnBaseSchema> & {
		references?: () => z.input<typeof textColumnSchema>;
	}
> = textColumnBaseSchema.and(
	z.object({
		references: z
			.function()
			.returns(z.lazy(() => textColumnSchema))
			.optional()
			.transform((fn) => fn?.()),
	}),
);

export const textColumnSchema = z.object({
	type: z.literal('text'),
	schema: textColumnOptsSchema,
});

export const dateColumnSchema = z.object({
	type: z.literal('date'),
	schema: baseColumnSchema.extend({
		default: z
			.union([
				sqlSchema,
				// transform to ISO string for serialization
				z
					.date()
					.transform((d) => d.toISOString()),
			])
			.optional(),
	}),
});

export const jsonColumnSchema = z.object({
	type: z.literal('json'),
	schema: baseColumnSchema.extend({
		default: z.unknown().optional(),
	}),
});

export const columnSchema = z.discriminatedUnion('type', [
	booleanColumnSchema,
	numberColumnSchema,
	textColumnSchema,
	dateColumnSchema,
	jsonColumnSchema,
]);
export const referenceableColumnSchema = z.union([textColumnSchema, numberColumnSchema]);

export const columnsSchema = z.record(columnSchema);

type ForeignKeysInput = {
	columns: MaybeArray<string>;
	references: () => MaybeArray<Omit<z.input<typeof referenceableColumnSchema>, 'references'>>;
};

type ForeignKeysOutput = Omit<ForeignKeysInput, 'references'> & {
	// reference fn called in `transform`. Ensures output is JSON serializable.
	references: MaybeArray<Omit<z.output<typeof referenceableColumnSchema>, 'references'>>;
};

const foreignKeysSchema: z.ZodType<ForeignKeysOutput, ZodTypeDef, ForeignKeysInput> = z.object({
	columns: z.string().or(z.array(z.string())),
	references: z
		.function()
		.returns(z.lazy(() => referenceableColumnSchema.or(z.array(referenceableColumnSchema))))
		.transform((fn) => fn()),
});

export const resolvedIndexSchema = z.object({
	on: z.string().or(z.array(z.string())),
	unique: z.boolean().optional(),
});
/** @deprecated */
const legacyIndexesSchema = z.record(resolvedIndexSchema);

export const indexSchema = z.object({
	on: z.string().or(z.array(z.string())),
	unique: z.boolean().optional(),
	name: z.string().optional(),
});
const indexesSchema = z.array(indexSchema);

export const tableSchema = z.object({
	columns: columnsSchema,
	indexes: indexesSchema.or(legacyIndexesSchema).optional(),
	foreignKeys: z.array(foreignKeysSchema).optional(),
	deprecated: z.boolean().optional().default(false),
});

export const tablesSchema = z.preprocess((rawTables) => {
	// Use `z.any()` to avoid breaking object references
	const tables = z.record(z.any()).parse(rawTables, { errorMap });
	for (const [tableName, table] of Object.entries(tables)) {
		// Append table and column names to columns.
		// Used to track table info for references.
		table.getName = () => tableName;
		const { columns } = z.object({ columns: z.record(z.any()) }).parse(table, { errorMap });
		for (const [columnName, column] of Object.entries(columns)) {
			column.schema.name = columnName;
			column.schema.collection = tableName;
		}
	}
	return rawTables;
}, z.record(tableSchema));

export const dbConfigSchema = z
	.object({
		tables: tablesSchema.optional(),
	})
	.transform(({ tables = {}, ...config }) => {
		return {
			...config,
			tables: mapObject(tables, (tableName, table) => {
				const { indexes = {} } = table;
				if (!Array.isArray(indexes)) {
					return { ...table, indexes };
				}
				const resolvedIndexes: Record<string, z.infer<typeof resolvedIndexSchema>> = {};
				for (const index of indexes) {
					if (index.name) {
						const { name, ...rest } = index;
						resolvedIndexes[index.name] = rest;
						continue;
					}
					// Sort index columns to ensure consistent index names
					const indexOn = Array.isArray(index.on) ? index.on.sort().join('_') : index.on;
					const name = tableName + '_' + indexOn + '_idx';
					resolvedIndexes[name] = index;
				}
				return {
					...table,
					indexes: resolvedIndexes,
				};
			}),
		};
	});

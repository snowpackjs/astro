export { defineDbIntegration } from './core/utils.js';
import { tableSchema } from './core/schemas.js';
import type { ColumnsConfig, TableConfig } from './core/types.js';
import { type Table, asDrizzleTable as internal_asDrizzleTable } from './runtime/index.js';

export function asDrizzleTable<
	TableName extends string = string,
	TColumns extends ColumnsConfig = ColumnsConfig,
>(name: TableName, tableConfig: TableConfig<TColumns>) {
	return internal_asDrizzleTable(name, tableSchema.parse(tableConfig)) as Table<
		TableName,
		TColumns
	>;
}

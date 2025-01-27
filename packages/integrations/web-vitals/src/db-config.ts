import { column, defineDb, defineTable } from 'astro:db';
// import { asDrizzleTable } from '@astrojs/db/utils';

const Metric = defineTable({
	columns: {
		pathname: column.text(),
		route: column.text(),
		name: column.text(),
		id: column.text({ primaryKey: true }),
		value: column.number(),
		rating: column.text(),
		timestamp: column.date(),
	},
	deprecated: Boolean(process.env.DEPRECATE_WEB_VITALS) ?? false,
});

// export const AstrojsWebVitals_Metric = asDrizzleTable('AstrojsWebVitals_Metric', Metric);

export default defineDb({
	tables: {
		AstrojsWebVitals_Metric: Metric,
	},
});

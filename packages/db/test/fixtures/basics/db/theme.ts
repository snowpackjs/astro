import { NOW, column, defineTable, sql } from 'astro:db';

export const Themes = defineTable({
	columns: {
		name: column.text(),
		added: column.date({
			default: sql`CURRENT_TIMESTAMP`,
		}),
		updated: column.date({
			default: NOW,
		}),
		isDark: column.boolean({ default: sql`TRUE`, deprecated: true }),
		owner: column.text({ optional: true, default: sql`NULL` }),
	},
});

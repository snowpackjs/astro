import { column, defineTable } from 'astro:db';

export const menu = defineTable({
	columns: {
		name: column.text(),
		type: column.text(),
		price: column.number(),
	},
});

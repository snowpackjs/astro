import { column, defineDb, defineTable } from 'astro:db';

const User = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		name: column.text(),
	},
});

export default defineDb({
	tables: { User },
});

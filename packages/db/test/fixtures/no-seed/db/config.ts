import { column, defineDb, defineTable } from 'astro:db';

const Author = defineTable({
	columns: {
		name: column.text(),
		age2: column.number({ optional: true }),
	},
});

export default defineDb({
	tables: { Author },
});

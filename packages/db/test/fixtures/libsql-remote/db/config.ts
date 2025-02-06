import { column, defineDb, defineTable } from 'astro:db';

const User = defineTable({
	columns: {
		id: column.text({ primaryKey: true, optional: false }),
		username: column.text({ optional: false, unique: true }),
		password: column.text({ optional: false }),
	},
});

export default defineDb({
	tables: { User },
});

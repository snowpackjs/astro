import { column, defineDb, defineTable } from 'astro:db';
import { Themes } from './theme';

const Author = defineTable({
	columns: {
		name: column.text(),
		age2: column.number({ optional: true }),
	},
});

const User = defineTable({
	columns: {
		id: column.text({ primaryKey: true, optional: false }),
		username: column.text({ optional: false, unique: true }),
		password: column.text({ optional: false }),
	},
});

const Session = defineTable({
	columns: {
		id: column.text({ primaryKey: true, optional: false }),
		expiresAt: column.number({ optional: false, name: 'expires_at' }),
		userId: column.text({ optional: false, references: () => User.columns.id, name: 'user_id' }),
	},
});

export default defineDb({
	tables: { Author, Themes, User, Session },
});

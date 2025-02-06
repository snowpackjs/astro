import { column, defineDb, defineTable } from 'astro:db';

const Recipe = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		title: column.text(),
		description: column.text(),
	},
});

const Ingredient = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		name: column.text(),
		quantity: column.number(),
		recipeId: column.number(),
	},
	indexes: {
		recipeIdx: { on: 'recipeId' },
	},
	foreignKeys: [{ columns: 'recipeId', references: () => [Recipe.columns.id] }],
});

export default defineDb({
	tables: { Recipe, Ingredient },
});

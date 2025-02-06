import { Ingredient, Recipe, db } from 'astro:db';

export default async function () {
	const pancakes = await db
		.insert(Recipe)
		.values({
			title: 'Pancakes',
			description: 'A delicious breakfast',
		})
		.returning()
		.get();

	await db.insert(Ingredient).values([
		{
			name: 'Flour',
			quantity: 1,
			recipeId: pancakes.id,
		},
		{
			name: 'Eggs',
			quantity: 2,
			recipeId: pancakes.id,
		},
		{
			name: 'Milk',
			quantity: 1,
			recipeId: pancakes.id,
		},
	]);

	const pizza = await db
		.insert(Recipe)
		.values({
			title: 'Pizza',
			description: 'A delicious dinner',
		})
		.returning()
		.get();

	await db.insert(Ingredient).values([
		{
			name: 'Flour',
			quantity: 1,
			recipeId: pizza.id,
		},
		{
			name: 'Eggs',
			quantity: 2,
			recipeId: pizza.id,
		},
		{
			name: 'Milk',
			quantity: 1,
			recipeId: pizza.id,
		},
		{
			name: 'Tomato Sauce',
			quantity: 1,
			recipeId: pizza.id,
		},
	]);
}

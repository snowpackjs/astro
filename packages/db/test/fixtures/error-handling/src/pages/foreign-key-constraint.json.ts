import { Ingredient, db, isDbError } from 'astro:db';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
	try {
		await db.insert(Ingredient).values({
			name: 'Flour',
			quantity: 1,
			// Trigger foreign key constraint error
			recipeId: 42,
		});
	} catch (e) {
		if (isDbError(e)) {
			return new Response(JSON.stringify({ message: `LibsqlError: ${e.message}`, code: e.code }));
		}
	}
	return new Response(JSON.stringify({ message: 'Did not raise expected exception' }));
};

import { db, sql } from 'astro:db';
/// <reference types="@astrojs/db" />
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
	const authors = await db.run(sql`SELECT * FROM Author`);
	return new Response(JSON.stringify(authors), {
		headers: {
			'content-type': 'application/json',
		},
	});
};

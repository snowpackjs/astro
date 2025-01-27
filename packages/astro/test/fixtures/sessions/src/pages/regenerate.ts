import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
	await context.session.regenerate();
	return Response.json({});
};

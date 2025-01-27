import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
	await context.session.destroy();
	return Response.json({});
};

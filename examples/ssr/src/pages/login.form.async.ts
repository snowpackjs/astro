import type { APIContext, APIRoute } from 'astro';

export const POST: APIRoute = ({ cookies }: APIContext) => {
	// add a new cookie
	cookies.set('user-id', '1', {
		path: '/',
		maxAge: 2592000,
	});

	return Response.json({
		ok: true,
		user: 1,
	});
};

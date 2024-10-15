import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
	if (context.url.pathname === '/url') {
		return new Response(JSON.stringify({ post: 'works' }), {
			headers: {
				'content-type': 'application/json',
			},
		});
	}

	return next();
});

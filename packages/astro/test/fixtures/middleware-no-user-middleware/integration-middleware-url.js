import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
	if (context.url.pathname === '/url') {
		return Response.json({ post: 'works' });
	}

	return next();
});

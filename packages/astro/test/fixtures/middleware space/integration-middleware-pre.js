import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
	if (context.url.pathname === '/integration-pre') {
		return new Response(JSON.stringify({ pre: 'works' }), {
			headers: {
				'content-type': 'application/json',
			},
		});
	}

	return next();
});

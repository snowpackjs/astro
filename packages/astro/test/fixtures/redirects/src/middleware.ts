import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(({ request }, next) => {
	if(new URL(request.url).pathname === '/middleware-redirect/') {
		return new Response(null, {
			status: 301,
			headers: {
				'Location': '/test'
			}
		});
	}
	return next();
});

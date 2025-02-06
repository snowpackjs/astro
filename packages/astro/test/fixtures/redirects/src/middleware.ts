import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ request, isRedirect }, next) => {
	if(new URL(request.url).pathname === '/middleware-redirect/') {
		return new Response(null, {
			status: 301,
			headers: {
				'Location': '/test'
			}
		});
	}
	const response = await next();
	response.headers.set('X-Is-Redirect', `${isRedirect}`);
	return response;
});

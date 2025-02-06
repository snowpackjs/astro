import { defineMiddleware, sequence } from 'astro:middleware';

const first = defineMiddleware(async (context, next) => {
	if (context.request.url.includes('/second')) {
		context.locals.name = 'second';
	} else {
		context.locals.name = 'bar';
	}
	return await next();
});

export const onRequest = sequence(first);

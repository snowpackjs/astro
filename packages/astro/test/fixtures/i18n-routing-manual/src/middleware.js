import { redirectToDefaultLocale, requestHasLocale } from 'astro:i18n';
import { defineMiddleware } from 'astro:middleware';

const allowList = new Set(['/help', '/help/']);

export const onRequest = defineMiddleware(async (context, next) => {
	if (allowList.has(context.url.pathname)) {
		return await next();
	}
	if (requestHasLocale(context)) {
		return await next();
	}

	if (context.url.pathname === '/' || context.url.pathname === '/redirect-me') {
		return redirectToDefaultLocale(context);
	}
	return new Response(null, {
		status: 404,
	});
});

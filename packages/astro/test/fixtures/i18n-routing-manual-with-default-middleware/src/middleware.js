import { middleware } from 'astro:i18n';
import { defineMiddleware, sequence } from 'astro:middleware';

const customLogic = defineMiddleware(async (context, next) => {
	const url = new URL(context.request.url);
	if (url.pathname.startsWith('/about')) {
		return new Response('ABOUT ME', {
			status: 200,
		});
	}

	const response = await next();

	return response;
});

export const onRequest = sequence(
	customLogic,
	middleware({
		prefixDefaultLocale: true,
		fallbackType: "rewrite"
	})
);

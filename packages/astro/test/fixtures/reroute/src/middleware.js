import { sequence } from 'astro:middleware';
import {defineMiddleware} from "astro/middleware";

let contextReroute = false;

export const first = async (context, next) => {
	if (context.url.pathname.includes('/auth')) {
	}

	return next();
};

export const second = async (context, next) => {
	if (context.url.pathname.includes('/auth')) {
		if (context.url.pathname.includes('/auth/dashboard')) {
			contextReroute = true;
			return await context.rewrite('/');
		}
		if (context.url.pathname.includes('/auth/base')) {
			return await next('/');
		}

		if (context.url.pathname.includes('/auth/params')) {
			return  next('/?foo=bar');
		}

		if (context.url.pathname.includes('/auth/astro-params')) {
			return next('/auth/1234');
		}
	}
	return next();
};

export const third = defineMiddleware(async (context, next) => {
	// just making sure that we are testing the change in context coming from `next()`
	if (context.url.pathname.startsWith('/') && contextReroute === false) {
		context.locals.auth = 'Third function called';
	}
	if (context.params?.id === '1234') {
		context.locals.auth = 'Params changed'
	}
	return next();
});

export const onRequest = sequence(first, second, third);

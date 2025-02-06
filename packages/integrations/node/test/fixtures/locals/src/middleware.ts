import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(({ url, locals }, next) => {
    if (url.pathname === "/from-astro-middleware") locals.foo = "baz";
    return next();
})

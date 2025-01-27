export function onRequest(ctx, next) {
    if (ctx.url.pathname !== '/') {
        return new Response(null, { status: 404 });
    }
    return next();
}
export async function onRequest(ctx, next) {
    if (ctx.url.pathname !== '/') {
        const response = await next()
        return new Response(response.body, { ...response, status: 404 })
    }
    return next();
}
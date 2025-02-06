export function onRequest (context, next) {
    if (context.request.url.includes('/virtual')) {
		return new Response('<span>Virtual!!</span>', {
			status: 200,
		});
	}
    return next()
}



export function onRequest(ctx, next) {
	Object.assign(ctx.locals, {
		localsPattern: ctx.routePattern,
		localsPrerendered: ctx.isPrerendered
	});
	return next()
}

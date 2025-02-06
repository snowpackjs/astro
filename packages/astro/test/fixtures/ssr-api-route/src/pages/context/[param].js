/**
 * @param {import('astro').APIContext} api
 */
export function GET(ctx) {
	return Response.json({
		cookiesExist: !!ctx.cookies,
		requestExist: !!ctx.request,
		redirectExist: !!ctx.redirect,
		propsExist: !!ctx.props,
		params: ctx.params,
		site: ctx.site?.toString(),
		generator: ctx.generator,
		url: ctx.url.toString(),
		clientAddress: ctx.clientAddress,
	});
}

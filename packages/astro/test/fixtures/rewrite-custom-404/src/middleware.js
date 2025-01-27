

export const onRequest = async (context, next) => {
		if (context.url.pathname.startsWith("/404") || context.url.pathname.startsWith("/500")) {
			Object.assign(context.locals, {
				interjected: "Interjected"
			});
		}
		return  await next();
}

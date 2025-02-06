/**
 * @type {import("astro").MiddlewareResponseHandler}
 */
export const onRequest = async (context, next) => {
	const test = 'something';
	const response = await next();
	return response;
};

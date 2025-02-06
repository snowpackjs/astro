export const hello = async () => 'hello world';

const message = await hello();

/**
 * @type {import("astro").MiddlewareResponseHandler}
 */
export const onRequest = async (context, next) => {
	const test = 'something';
	context.cookies.set('foo', 'bar');
	const response = await next();
	response.headers.set('x-message', message);	
	return response;
};

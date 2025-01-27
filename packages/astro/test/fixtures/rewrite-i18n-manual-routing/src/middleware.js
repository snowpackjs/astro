export const onRequest = async (_ctx, next) => {
	const response = await next('/');
	console.log('expected response.status is', response.status);
	return response;
};

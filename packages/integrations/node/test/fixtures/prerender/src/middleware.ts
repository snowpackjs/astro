import { shared } from './shared';
export const onRequest = (ctx, next) => {
	ctx.locals.name = shared;
	return next();
};

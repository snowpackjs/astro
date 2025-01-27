import type { MiddlewareHandler } from '../../types/public/common.js';
import { NOOP_MIDDLEWARE_HEADER } from '../constants.js';

export const NOOP_MIDDLEWARE_FN: MiddlewareHandler = async (_ctx, next) => {
	const response = await next();
	response.headers.set(NOOP_MIDDLEWARE_HEADER, 'true');
	return response;
};

import { defineMiddleware } from '../../virtual-modules/middleware.js';
import { getActionContext } from './virtual/server.js';

export const onRequest = defineMiddleware(async (context, next) => {
	if (context.isPrerendered) return next();
	const { action, setActionResult, serializeActionResult } = getActionContext(context);

	if (action?.calledFrom === 'form') {
		const actionResult = await action.handler();
		setActionResult(action.name, serializeActionResult(actionResult));
	}
	return next();
});

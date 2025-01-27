import { defineMiddleware, sequence } from 'astro:middleware';
import { getActionContext } from 'astro:actions';

const actionCookieForwarding = defineMiddleware(async (ctx, next) => {
	if (ctx.isPrerendered) return next();

	const { action, setActionResult, serializeActionResult } = getActionContext(ctx);

	const payload = ctx.cookies.get('ACTION_PAYLOAD');
	if (payload) {
		const { actionName, actionResult } = payload.json();
		setActionResult(actionName, actionResult);
		ctx.cookies.delete('ACTION_PAYLOAD');
		return next();
	}

	if (
		action?.calledFrom === 'rpc' &&
		action.name === 'locked' &&
		!ctx.cookies.has('actionCookie')
	) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (action?.calledFrom === 'form' && ctx.url.searchParams.has('actionCookieForwarding')) {
		const actionResult = await action.handler();

		ctx.cookies.set('ACTION_PAYLOAD', {
			actionName: action.name,
			actionResult: serializeActionResult(actionResult),
		});

		if (actionResult.error) {
			const referer = ctx.request.headers.get('Referer');
			if (!referer) {
				throw new Error('Internal: Referer unexpectedly missing from Action POST request.');
			}
			return ctx.redirect(referer);
		}
		return ctx.redirect(ctx.originPathname);
	}

	return next();
});

export const onRequest = sequence(
	defineMiddleware((ctx, next) => {
		ctx.locals.user = {
			name: 'Houston',
		};
		return next();
	}),
	actionCookieForwarding,
);

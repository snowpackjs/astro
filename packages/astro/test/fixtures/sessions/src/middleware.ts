import { defineMiddleware } from 'astro:middleware';
import { getActionContext } from 'astro:actions';

const ACTION_SESSION_KEY = 'actionResult'

export const onRequest = defineMiddleware(async (context, next) => {
  // Skip requests for prerendered pages
  if (context.isPrerendered) return next();

  const { action, setActionResult, serializeActionResult } =
    getActionContext(context);

		console.log(action?.name)

	const actionPayload = await context.session.get(ACTION_SESSION_KEY);

  if (actionPayload) {
    setActionResult(actionPayload.actionName, actionPayload.actionResult);
    context.session.delete(ACTION_SESSION_KEY);
    return next();
  }

  // If an action was called from an HTML form action,
  // call the action handler and redirect to the destination page
  if (action?.calledFrom === "form") {
    const actionResult = await action.handler();

    context.session.set(ACTION_SESSION_KEY, {
      actionName: action.name,
      actionResult: serializeActionResult(actionResult),
    });


    // Redirect back to the previous page on error
    if (actionResult.error) {
      const referer = context.request.headers.get("Referer");
      if (!referer) {
        throw new Error(
          "Internal: Referer unexpectedly missing from Action POST request.",
        );
      }
      return context.redirect(referer);
    }
    // Redirect to the destination page on success
    return context.redirect(context.originPathname);
  }

  return next();
});

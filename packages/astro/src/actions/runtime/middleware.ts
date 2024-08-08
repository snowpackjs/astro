import { yellow } from 'kleur/colors';
import type { APIContext, MiddlewareNext } from '../../@types/astro.js';
import { ActionQueryStringInvalidError } from '../../core/errors/errors-data.js';
import { AstroError } from '../../core/errors/errors.js';
import { defineMiddleware } from '../../core/middleware/index.js';
import { formContentTypes, hasContentType } from './utils.js';
import { getAction } from './virtual/get-action.js';
import {
	type SafeResult,
	type SerializedActionResult,
	serializeActionResult,
} from './virtual/shared.js';
import { ACTION_QUERY_PARAMS } from '../consts.js';

export type ActionPayload = {
	actionResult: SerializedActionResult;
	actionName: string;
};

export type Locals = {
	_actionPayload: ActionPayload;
};

export const onRequest = defineMiddleware(async (context, next) => {
	const locals = context.locals as Locals;
	const { request } = context;
	// Actions middleware may have run already after a path rewrite.
	// See https://github.com/withastro/roadmap/blob/feat/reroute/proposals/0047-rerouting.md#ctxrewrite
	// `_actionPayload` is the same for every page,
	// so short circuit if already defined.
	if (locals._actionPayload) return next();

	const actionPayload = context.cookies.get(ACTION_QUERY_PARAMS.actionPayload)?.json();
	if (actionPayload) {
		if (!isActionPayload(actionPayload)) {
			throw new Error('Internal: Invalid action payload in cookie.');
		}
		return renderResult({ context, next, ...actionPayload });
	}

	// Heuristic: If body is null, Astro might've reset this for prerendering.
	if (import.meta.env.DEV && request.method === 'POST' && request.body === null) {
		// eslint-disable-next-line no-console
		console.warn(
			yellow('[astro:actions]'),
			'POST requests should not be sent to prerendered pages. If you\'re using Actions, disable prerendering with `export const prerender = "false".',
		);
		return next();
	}

	const actionName = context.url.searchParams.get('_astroAction');

	if (context.request.method === 'POST' && actionName) {
		return handlePost({ context, next, actionName });
	}

	if (context.request.method === 'POST') {
		return handlePostLegacy({ context, next });
	}

	return next();
});

async function renderResult({
	context,
	next,
	actionResult,
	actionName,
}: {
	context: APIContext;
	next: MiddlewareNext;
	actionResult: SerializedActionResult;
	actionName: string;
}) {
	const locals = context.locals as Locals;

	locals._actionPayload = { actionResult, actionName };
	const response = await next();
	context.cookies.delete(ACTION_QUERY_PARAMS.actionPayload);

	if (locals._actionPayload.actionResult.type === 'error') {
		return new Response(response.body, {
			status: locals._actionPayload.actionResult.status,
			statusText: locals._actionPayload.actionResult.type,
			headers: response.headers,
		});
	}
	return response;
}

async function handlePost({
	context,
	next,
	actionName,
}: { context: APIContext; next: MiddlewareNext; actionName: string }) {
	const { request } = context;

	const baseAction = await getAction(actionName);
	if (!baseAction) {
		throw new AstroError({
			...ActionQueryStringInvalidError,
			message: ActionQueryStringInvalidError.message(actionName),
		});
	}

	const contentType = request.headers.get('content-type');
	let formData: FormData | undefined;
	if (contentType && hasContentType(contentType, formContentTypes)) {
		formData = await request.clone().formData();
	}
	const action = baseAction.bind(context);
	const actionResult = await action(formData);

	if (context.url.searchParams.has('_astroActionDisableRedirect')) {
		return renderResult({
			context,
			next,
			actionName,
			actionResult: serializeActionResult(actionResult),
		});
	}

	return redirectWithResult({ context, actionName, actionResult });
}

async function redirectWithResult({
	context,
	actionName,
	actionResult,
}: {
	context: APIContext;
	actionName: string;
	actionResult: SafeResult<any, any>;
}) {
	context.cookies.set(ACTION_QUERY_PARAMS.actionPayload, {
		actionName,
		actionResult: serializeActionResult(actionResult),
	});

	if (actionResult.error) {
		const referer = context.request.headers.get('Referer');
		if (!referer) {
			throw new Error('Internal: Referer unexpectedly missing from Action POST request.');
		}

		return context.redirect(referer);
	}

	return context.redirect(context.url.pathname);
}

async function handlePostLegacy({ context, next }: { context: APIContext; next: MiddlewareNext }) {
	const { request } = context;

	// We should not run a middleware handler for fetch()
	// requests directly to the /_actions URL.
	// Otherwise, we may handle the result twice.
	if (context.url.pathname.startsWith('/_actions')) return next();

	const contentType = request.headers.get('content-type');
	let formData: FormData | undefined;
	if (contentType && hasContentType(contentType, formContentTypes)) {
		formData = await request.clone().formData();
	}

	if (!formData) return next();

	const actionName = formData.get('_astroAction') as string;
	if (!actionName) return next();

	const baseAction = await getAction(actionName);
	if (!baseAction) {
		throw new AstroError({
			...ActionQueryStringInvalidError,
			message: ActionQueryStringInvalidError.message(actionName),
		});
	}

	const action = baseAction.bind(context);
	const actionResult = await action(formData);
	return redirectWithResult({ context, actionName, actionResult });
}

function isActionPayload(json: unknown): json is ActionPayload {
	if (typeof json !== 'object' || json == null) return false;

	if (!('actionResult' in json) || typeof json.actionResult !== 'object') return false;
	if (!('actionName' in json) || typeof json.actionName !== 'string') return false;
	return true;
}

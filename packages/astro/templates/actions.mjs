import {
	ACTION_QUERY_PARAMS,
	ActionError,
	appendForwardSlash,
	deserializeActionResult,
	getActionQueryString,
} from 'astro:actions';

const ENCODED_DOT = '%2E';

function toActionProxy(actionCallback = {}, aggregatedPath = '') {
	return new Proxy(actionCallback, {
		get(target, objKey) {
			if (objKey in target || typeof objKey === 'symbol') {
				return target[objKey];
			}
			// Add the key, encoding dots so they're not interpreted as nested properties.
			const path =
				aggregatedPath + encodeURIComponent(objKey.toString()).replaceAll('.', ENCODED_DOT);
			function action(param) {
				return handleAction(param, path, this);
			}

			Object.assign(action, {
				queryString: getActionQueryString(path),
				toString: () => action.queryString,
				// Progressive enhancement info for React.
				$$FORM_ACTION: function () {
					const searchParams = new URLSearchParams(action.toString());
					return {
						method: 'POST',
						// `name` creates a hidden input.
						// It's unused by Astro, but we can't turn this off.
						// At least use a name that won't conflict with a user's formData.
						name: '_astroAction',
						action: '?' + searchParams.toString(),
					};
				},
				// Note: `orThrow` does not have progressive enhancement info.
				// If you want to throw exceptions,
				//  you must handle those exceptions with client JS.
				async orThrow(param) {
					const { data, error } = await handleAction(param, path, this);
					if (error) throw error;
					return data;
				},
			});

			// recurse to construct queries for nested object paths
			// ex. actions.user.admins.auth()
			return toActionProxy(action, path + '.');
		},
	});
}

const SHOULD_APPEND_TRAILING_SLASH = '/** @TRAILING_SLASH@ **/';

/** @param {import('astro:actions').ActionClient<any, any, any>} */
export function getActionPath(action) {
	let path = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/_actions/${new URLSearchParams(action.toString()).get(ACTION_QUERY_PARAMS.actionName)}`;
	if (SHOULD_APPEND_TRAILING_SLASH) {
		path = appendForwardSlash(path);
	}
	return path;
}

/**
 * @param {*} param argument passed to the action when called server or client-side.
 * @param {string} path Built path to call action by path name.
 * @param {import('../dist/types/public/context.js').APIContext | undefined} context Injected API context when calling actions from the server.
 * Usage: `actions.[name](param)`.
 * @returns {Promise<import('../dist/actions/runtime/virtual/shared.js').SafeResult<any, any>>}
 */
async function handleAction(param, path, context) {
	// When running server-side, import the action and call it.
	if (import.meta.env.SSR) {
		const { getAction } = await import('astro/actions/runtime/virtual/get-action.js');
		const action = await getAction(path);
		if (!action) throw new Error(`Action not found: ${path}`);

		return action.bind(context)(param);
	}

	// When running client-side, make a fetch request to the action path.
	const headers = new Headers();
	headers.set('Accept', 'application/json');
	let body = param;
	if (!(body instanceof FormData)) {
		try {
			body = JSON.stringify(param);
		} catch (e) {
			throw new ActionError({
				code: 'BAD_REQUEST',
				message: `Failed to serialize request body to JSON. Full error: ${e.message}`,
			});
		}
		if (body) {
			headers.set('Content-Type', 'application/json');
		} else {
			headers.set('Content-Length', '0');
		}
	}
	const rawResult = await fetch(
		getActionPath({
			toString() {
				return getActionQueryString(path);
			},
		}),
		{
			method: 'POST',
			body,
			headers,
		},
	);

	if (rawResult.status === 204) {
		return deserializeActionResult({ type: 'empty', status: 204 });
	}

	return deserializeActionResult({
		type: rawResult.ok ? 'data' : 'error',
		body: await rawResult.text(),
	});
}

export const actions = toActionProxy();

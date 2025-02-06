import { AstroError } from 'astro/errors';

type FormFn<T> = (formData: FormData) => Promise<T>;

/**
 * Use an Astro Action with React `useActionState()`.
 * This function matches your action to the expected types,
 * and preserves metadata for progressive enhancement.
 * To read state from your action handler, use {@linkcode experimental_getActionState}.
 */
export function experimental_withState<T>(action: FormFn<T>) {
	// React expects two positional arguments when using `useActionState()`:
	// 1. The initial state value.
	// 2. The form data object.

	// Map this first argument to a hidden input
	// for retrieval from `getActionState()`.
	const callback = async function (state: T, formData: FormData) {
		formData.set('_astroActionState', JSON.stringify(state));
		return action(formData);
	};
	if (!('$$FORM_ACTION' in action)) return callback;

	// Re-bind progressive enhancement info for React.
	callback.$$FORM_ACTION = action.$$FORM_ACTION;
	// Called by React when form state is passed from the server.
	// If the action names match, React returns this state from `useActionState()`.
	callback.$$IS_SIGNATURE_EQUAL = (incomingActionName: string) => {
		const actionName = new URLSearchParams(action.toString()).get('_action');
		return actionName === incomingActionName;
	};

	// React calls `.bind()` internally to pass the initial state value.
	// Calling `.bind()` seems to remove our `$$FORM_ACTION` metadata,
	// so we need to define our *own* `.bind()` method to preserve that metadata.
	Object.defineProperty(callback, 'bind', {
		value: (...args: Parameters<typeof callback>) =>
			injectStateIntoFormActionData(callback, ...args),
	});
	return callback;
}

/**
 * Retrieve the state object from your action handler when using `useActionState()`.
 * To ensure this state is retrievable, use the {@linkcode experimental_withState} helper.
 */
export async function experimental_getActionState<T>({
	request,
}: {
	request: Request;
}): Promise<T> {
	const contentType = request.headers.get('Content-Type');
	if (!contentType || !isFormRequest(contentType)) {
		throw new AstroError(
			'`getActionState()` must be called with a form request.',
			"Ensure your action uses the `accept: 'form'` option.",
		);
	}
	const formData = await request.clone().formData();
	const state = formData.get('_astroActionState')?.toString();
	if (!state) {
		throw new AstroError(
			'`getActionState()` could not find a state object.',
			'Ensure your action was passed to `useActionState()` with the `experimental_withState()` wrapper.',
		);
	}
	return JSON.parse(state) as T;
}

const formContentTypes = ['application/x-www-form-urlencoded', 'multipart/form-data'];

function isFormRequest(contentType: string) {
	// Split off parameters like charset or boundary
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type#content-type_in_html_forms
	const type = contentType.split(';')[0].toLowerCase();

	return formContentTypes.some((t) => type === t);
}

/**
 * Override the default `.bind()` method to:
 * 1. Inject the form state into the form data for progressive enhancement.
 * 2. Preserve the `$$FORM_ACTION` metadata.
 */
function injectStateIntoFormActionData<R extends [this: unknown, state: unknown, ...unknown[]]>(
	fn: (...args: R) => unknown,
	...args: R
) {
	const boundFn = Function.prototype.bind.call(fn, ...args);
	Object.assign(boundFn, fn);
	const [, state] = args;

	if ('$$FORM_ACTION' in fn && typeof fn.$$FORM_ACTION === 'function') {
		const metadata = fn.$$FORM_ACTION();
		boundFn.$$FORM_ACTION = () => {
			const data = (metadata.data as FormData) ?? new FormData();
			data.set('_astroActionState', JSON.stringify(state));
			metadata.data = data;

			return metadata;
		};
	}
	return boundFn;
}

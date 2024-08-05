import type { z } from 'zod';
import type { ErrorInferenceObject, MaybePromise } from '../utils.js';
import { stringify as devalueStringify, parse as devalueParse } from 'devalue';

export const ACTION_ERROR_CODES = [
	'BAD_REQUEST',
	'UNAUTHORIZED',
	'FORBIDDEN',
	'NOT_FOUND',
	'TIMEOUT',
	'CONFLICT',
	'PRECONDITION_FAILED',
	'PAYLOAD_TOO_LARGE',
	'UNSUPPORTED_MEDIA_TYPE',
	'UNPROCESSABLE_CONTENT',
	'TOO_MANY_REQUESTS',
	'CLIENT_CLOSED_REQUEST',
	'INTERNAL_SERVER_ERROR',
] as const;

export type ActionErrorCode = (typeof ACTION_ERROR_CODES)[number];

const codeToStatusMap: Record<ActionErrorCode, number> = {
	// Implemented from tRPC error code table
	// https://trpc.io/docs/server/error-handling#error-codes
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	TIMEOUT: 405,
	CONFLICT: 409,
	PRECONDITION_FAILED: 412,
	PAYLOAD_TOO_LARGE: 413,
	UNSUPPORTED_MEDIA_TYPE: 415,
	UNPROCESSABLE_CONTENT: 422,
	TOO_MANY_REQUESTS: 429,
	CLIENT_CLOSED_REQUEST: 499,
	INTERNAL_SERVER_ERROR: 500,
};

const statusToCodeMap: Record<number, ActionErrorCode> = Object.entries(codeToStatusMap).reduce(
	// reverse the key-value pairs
	(acc, [key, value]) => ({ ...acc, [value]: key }),
	{}
);

// T is used for error inference with SafeInput -> isInputError.
// See: https://github.com/withastro/astro/pull/11173/files#r1622767246
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class ActionError<T extends ErrorInferenceObject = ErrorInferenceObject> extends Error {
	type = 'AstroActionError';
	code: ActionErrorCode = 'INTERNAL_SERVER_ERROR';
	status = 500;

	constructor(params: { message?: string; code: ActionErrorCode; stack?: string }) {
		super(params.message);
		this.code = params.code;
		this.status = ActionError.codeToStatus(params.code);
		if (params.stack) {
			this.stack = params.stack;
		}
	}

	static codeToStatus(code: ActionErrorCode): number {
		return codeToStatusMap[code];
	}

	static statusToCode(status: number): ActionErrorCode {
		return statusToCodeMap[status] ?? 'INTERNAL_SERVER_ERROR';
	}

	static fromJson(body: any) {
		if (
			typeof body === 'object' &&
			body?.type === 'AstroActionInputError' &&
			Array.isArray(body.issues)
		) {
			return new ActionInputError(body.issues);
		}
		if (isActionError(body)) {
			return new ActionError(body);
		}
		return new ActionError({
			message: body.message,
			code: ActionError.statusToCode(body.status),
		});
	}
}

export function isActionError(error?: unknown): error is ActionError {
	return (
		typeof error === 'object' &&
		error != null &&
		'type' in error &&
		error.type === 'AstroActionError'
	);
}

export function isInputError<T extends ErrorInferenceObject>(
	error?: ActionError<T>
): error is ActionInputError<T>;
export function isInputError(error?: unknown): error is ActionInputError<ErrorInferenceObject>;
export function isInputError<T extends ErrorInferenceObject>(
	error?: unknown | ActionError<T>
): error is ActionInputError<T> {
	return (
		typeof error === 'object' &&
		error != null &&
		'type' in error &&
		error.type === 'AstroActionInputError'
	);
}

export type SafeResult<TInput extends ErrorInferenceObject, TOutput> =
	| {
			data: TOutput;
			error: undefined;
	  }
	| {
			data: undefined;
			error: ActionError<TInput>;
	  };

export class ActionInputError<T extends ErrorInferenceObject> extends ActionError {
	type = 'AstroActionInputError';

	// We don't expose all ZodError properties.
	// Not all properties will serialize from server to client,
	// and we don't want to import the full ZodError object into the client.

	issues: z.ZodIssue[];
	fields: z.ZodError<T>['formErrors']['fieldErrors'];

	constructor(issues: z.ZodIssue[]) {
		super({
			message: `Failed to validate: ${JSON.stringify(issues, null, 2)}`,
			code: 'BAD_REQUEST',
		});
		this.issues = issues;
		this.fields = {};
		for (const issue of issues) {
			if (issue.path.length > 0) {
				const key = issue.path[0].toString() as keyof typeof this.fields;
				this.fields[key] ??= [];
				this.fields[key]?.push(issue.message);
			}
		}
	}
}

export async function callSafely<TOutput>(
	handler: () => MaybePromise<TOutput>
): Promise<SafeResult<z.ZodType, TOutput>> {
	try {
		const data = await handler();
		return { data, error: undefined };
	} catch (e) {
		if (e instanceof ActionError) {
			return { data: undefined, error: e };
		}
		return {
			data: undefined,
			error: new ActionError({
				message: e instanceof Error ? e.message : 'Unknown error',
				code: 'INTERNAL_SERVER_ERROR',
			}),
		};
	}
}

export function getActionQueryString(name: string) {
	const searchParams = new URLSearchParams({ _astroAction: name });
	return `?${searchParams.toString()}`;
}

/**
 * @deprecated You can now pass action functions
 * directly to the `action` attribute on a form.
 *
 * Example: `<form action={actions.like} />`
 */
export function getActionProps<T extends (args: FormData) => MaybePromise<unknown>>(action: T) {
	const params = new URLSearchParams(action.toString());
	const actionName = params.get('_astroAction');
	if (!actionName) {
		// No need for AstroError. `getActionProps()` will be removed for stable.
		throw new Error('Invalid actions function was passed to getActionProps()');
	}
	return {
		type: 'hidden',
		name: '_astroAction',
		value: actionName,
	} as const;
}

export type SerializedActionResult =
	| {
			type: 'data';
			contentType: 'application/json+devalue';
			status: 200;
			body: string;
	  }
	| {
			type: 'error';
			contentType: 'application/json';
			status: number;
			body: string;
	  }
	| {
			type: 'empty';
			status: 204;
	  };

export function serializeActionResult(res: SafeResult<any, any>): SerializedActionResult {
	if (res.error) {
		return {
			type: 'error',
			status: res.error.status,
			contentType: 'application/json',
			body: JSON.stringify({
				...res.error,
				message: res.error.message,
				stack: import.meta.env.PROD ? undefined : res.error.stack,
			}),
		};
	}
	if (res.data === undefined) {
		return {
			type: 'empty',
			status: 204,
		};
	}
	return {
		type: 'data',
		status: 200,
		contentType: 'application/json+devalue',
		body: devalueStringify(res.data, {
			// Add support for URL objects
			URL: (value) => value instanceof URL && value.href,
		}),
	};
}

export function deserializeActionResult(res: SerializedActionResult): SafeResult<any, any> {
	if (res.type === 'error') {
		return { error: ActionError.fromJson(JSON.parse(res.body)), data: undefined };
	}
	if (res.type === 'empty') {
		return { data: undefined, error: undefined };
	}
	return {
		data: devalueParse(res.body, {
			URL: (href) => new URL(href),
		}),
		error: undefined,
	};
}

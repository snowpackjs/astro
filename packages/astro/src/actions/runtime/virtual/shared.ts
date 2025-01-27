import { parse as devalueParse, stringify as devalueStringify } from 'devalue';
import type { z } from 'zod';
import { REDIRECT_STATUS_CODES } from '../../../core/constants.js';
import { ActionsReturnedInvalidDataError } from '../../../core/errors/errors-data.js';
import { AstroError } from '../../../core/errors/errors.js';
import { appendForwardSlash as _appendForwardSlash } from '../../../core/path.js';
import { ACTION_QUERY_PARAMS as _ACTION_QUERY_PARAMS } from '../../consts.js';
import type {
	ErrorInferenceObject,
	MaybePromise,
	ActionAPIContext as _ActionAPIContext,
} from '../utils.js';

export type ActionAPIContext = _ActionAPIContext;
export const ACTION_QUERY_PARAMS = _ACTION_QUERY_PARAMS;

export const appendForwardSlash = _appendForwardSlash;

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
	{},
);

// T is used for error inference with SafeInput -> isInputError.
// See: https://github.com/withastro/astro/pull/11173/files#r1622767246
export class ActionError<_T extends ErrorInferenceObject = ErrorInferenceObject> extends Error {
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
		if (isInputError(body)) {
			return new ActionInputError(body.issues);
		}
		if (isActionError(body)) {
			return new ActionError(body);
		}
		return new ActionError({
			code: 'INTERNAL_SERVER_ERROR',
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
	error?: ActionError<T>,
): error is ActionInputError<T>;
export function isInputError(error?: unknown): error is ActionInputError<ErrorInferenceObject>;
export function isInputError<T extends ErrorInferenceObject>(
	error?: unknown | ActionError<T>,
): error is ActionInputError<T> {
	return (
		typeof error === 'object' &&
		error != null &&
		'type' in error &&
		error.type === 'AstroActionInputError' &&
		'issues' in error &&
		Array.isArray(error.issues)
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
	handler: () => MaybePromise<TOutput>,
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
	const searchParams = new URLSearchParams({ [_ACTION_QUERY_PARAMS.actionName]: name });
	return `?${searchParams.toString()}`;
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
		if (import.meta.env?.DEV) {
			actionResultErrorStack.set(res.error.stack);
		}

		let body: Record<string, any>;
		if (res.error instanceof ActionInputError) {
			body = {
				type: res.error.type,
				issues: res.error.issues,
				fields: res.error.fields,
			};
		} else {
			body = {
				...res.error,
				message: res.error.message,
			};
		}

		return {
			type: 'error',
			status: res.error.status,
			contentType: 'application/json',
			body: JSON.stringify(body),
		};
	}
	if (res.data === undefined) {
		return {
			type: 'empty',
			status: 204,
		};
	}
	let body;
	try {
		body = devalueStringify(res.data, {
			// Add support for URL objects
			URL: (value) => value instanceof URL && value.href,
		});
	} catch (e) {
		let hint = ActionsReturnedInvalidDataError.hint;
		if (res.data instanceof Response) {
			hint = REDIRECT_STATUS_CODES.includes(res.data.status as any)
				? 'If you need to redirect when the action succeeds, trigger a redirect where the action is called. See the Actions guide for server and client redirect examples: https://docs.astro.build/en/guides/actions.'
				: 'If you need to return a Response object, try using a server endpoint instead. See https://docs.astro.build/en/guides/endpoints/#server-endpoints-api-routes';
		}
		throw new AstroError({
			...ActionsReturnedInvalidDataError,
			message: ActionsReturnedInvalidDataError.message(String(e)),
			hint,
		});
	}
	return {
		type: 'data',
		status: 200,
		contentType: 'application/json+devalue',
		body,
	};
}

export function deserializeActionResult(res: SerializedActionResult): SafeResult<any, any> {
	if (res.type === 'error') {
		let json;
		try {
			json = JSON.parse(res.body);
		} catch {
			return {
				data: undefined,
				error: new ActionError({
					message: res.body,
					code: 'INTERNAL_SERVER_ERROR',
				}),
			};
		}
		if (import.meta.env?.PROD) {
			return { error: ActionError.fromJson(json), data: undefined };
		} else {
			const error = ActionError.fromJson(json);
			error.stack = actionResultErrorStack.get();
			return {
				error,
				data: undefined,
			};
		}
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

// in-memory singleton to save the stack trace
const actionResultErrorStack = (function actionResultErrorStackFn() {
	let errorStack: string | undefined;
	return {
		set(stack: string | undefined) {
			errorStack = stack;
		},
		get() {
			return errorStack;
		},
	};
})();

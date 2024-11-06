import { z } from 'zod';
import { ActionCalledFromServerError } from '../../../core/errors/errors-data.js';
import { AstroError } from '../../../core/errors/errors.js';
import {
	formContentTypes,
	hasContentType,
	type ActionAPIContext,
	type ErrorInferenceObject,
	type MaybePromise,
} from '../utils.js';
import {
	ACTION_QUERY_PARAMS,
	ActionError,
	ActionInputError,
	type SafeResult,
	type SerializedActionResult,
	callSafely,
	deserializeActionResult,
	serializeActionResult,
} from './shared.js';
import type { Locals } from '../utils.js';
import { getAction } from './get-action.js';
import type { APIContext } from '../../../types/public/index.js';

export * from './shared.js';

export type ActionAccept = 'form' | 'json';

export type ActionHandler<TInputSchema, TOutput> = TInputSchema extends z.ZodType
	? (input: z.infer<TInputSchema>, context: ActionAPIContext) => MaybePromise<TOutput>
	: (input: any, context: ActionAPIContext) => MaybePromise<TOutput>;

export type ActionReturnType<T extends ActionHandler<any, any>> = Awaited<ReturnType<T>>;

export type ActionClient<
	TOutput,
	TAccept extends ActionAccept | undefined,
	TInputSchema extends z.ZodType | undefined,
> = TInputSchema extends z.ZodType
	? ((
			input: TAccept extends 'form' ? FormData : z.input<TInputSchema>,
		) => Promise<
			SafeResult<
				z.input<TInputSchema> extends ErrorInferenceObject
					? z.input<TInputSchema>
					: ErrorInferenceObject,
				Awaited<TOutput>
			>
		>) & {
			queryString: string;
			orThrow: (
				input: TAccept extends 'form' ? FormData : z.input<TInputSchema>,
			) => Promise<Awaited<TOutput>>;
		}
	: ((input?: any) => Promise<SafeResult<never, Awaited<TOutput>>>) & {
			orThrow: (input?: any) => Promise<Awaited<TOutput>>;
		};

export function defineAction<
	TOutput,
	TAccept extends ActionAccept | undefined = undefined,
	TInputSchema extends z.ZodType | undefined = TAccept extends 'form'
		? // If `input` is omitted, default to `FormData` for forms and `any` for JSON.
			z.ZodType<FormData>
		: undefined,
>({
	accept,
	input: inputSchema,
	handler,
}: {
	input?: TInputSchema;
	accept?: TAccept;
	handler: ActionHandler<TInputSchema, TOutput>;
}): ActionClient<TOutput, TAccept, TInputSchema> & string {
	const serverHandler =
		accept === 'form'
			? getFormServerHandler(handler, inputSchema)
			: getJsonServerHandler(handler, inputSchema);

	async function safeServerHandler(this: ActionAPIContext, unparsedInput: unknown) {
		if (typeof this === 'function') {
			throw new AstroError(ActionCalledFromServerError);
		}
		return callSafely(() => serverHandler(unparsedInput, this));
	}

	Object.assign(safeServerHandler, {
		orThrow(this: ActionAPIContext, unparsedInput: unknown) {
			if (typeof this === 'function') {
				throw new AstroError(ActionCalledFromServerError);
			}
			return serverHandler(unparsedInput, this);
		},
	});

	return safeServerHandler as ActionClient<TOutput, TAccept, TInputSchema> & string;
}

function getFormServerHandler<TOutput, TInputSchema extends z.ZodType>(
	handler: ActionHandler<TInputSchema, TOutput>,
	inputSchema?: TInputSchema,
) {
	return async (unparsedInput: unknown, context: ActionAPIContext): Promise<Awaited<TOutput>> => {
		if (!(unparsedInput instanceof FormData)) {
			throw new ActionError({
				code: 'UNSUPPORTED_MEDIA_TYPE',
				message: 'This action only accepts FormData.',
			});
		}

		if (!inputSchema) return await handler(unparsedInput, context);

		const baseSchema = unwrapBaseObjectSchema(inputSchema, unparsedInput);
		const parsed = await inputSchema.safeParseAsync(
			baseSchema instanceof z.ZodObject
				? formDataToObject(unparsedInput, baseSchema)
				: unparsedInput,
		);
		if (!parsed.success) {
			throw new ActionInputError(parsed.error.issues);
		}
		return await handler(parsed.data, context);
	};
}

function getJsonServerHandler<TOutput, TInputSchema extends z.ZodType>(
	handler: ActionHandler<TInputSchema, TOutput>,
	inputSchema?: TInputSchema,
) {
	return async (unparsedInput: unknown, context: ActionAPIContext): Promise<Awaited<TOutput>> => {
		if (unparsedInput instanceof FormData) {
			throw new ActionError({
				code: 'UNSUPPORTED_MEDIA_TYPE',
				message: 'This action only accepts JSON.',
			});
		}

		if (!inputSchema) return await handler(unparsedInput, context);
		const parsed = await inputSchema.safeParseAsync(unparsedInput);
		if (!parsed.success) {
			throw new ActionInputError(parsed.error.issues);
		}
		return await handler(parsed.data, context);
	};
}

/** Transform form data to an object based on a Zod schema. */
export function formDataToObject<T extends z.AnyZodObject>(
	formData: FormData,
	schema: T,
): Record<string, unknown> {
	const obj: Record<string, unknown> =
		schema._def.unknownKeys === 'passthrough' ? Object.fromEntries(formData.entries()) : {};
	for (const [key, baseValidator] of Object.entries(schema.shape)) {
		let validator = baseValidator;

		while (
			validator instanceof z.ZodOptional ||
			validator instanceof z.ZodNullable ||
			validator instanceof z.ZodDefault
		) {
			// use default value when key is undefined
			if (validator instanceof z.ZodDefault && !formData.has(key)) {
				obj[key] = validator._def.defaultValue();
			}
			validator = validator._def.innerType;
		}

		if (!formData.has(key) && key in obj) {
			// continue loop if form input is not found and default value is set
			continue;
		} else if (validator instanceof z.ZodBoolean) {
			const val = formData.get(key);
			obj[key] = val === 'true' ? true : val === 'false' ? false : formData.has(key);
		} else if (validator instanceof z.ZodArray) {
			obj[key] = handleFormDataGetAll(key, formData, validator);
		} else {
			obj[key] = handleFormDataGet(key, formData, validator, baseValidator);
		}
	}
	return obj;
}

function handleFormDataGetAll(
	key: string,
	formData: FormData,
	validator: z.ZodArray<z.ZodUnknown>,
) {
	const entries = Array.from(formData.getAll(key));
	const elementValidator = validator._def.type;
	if (elementValidator instanceof z.ZodNumber) {
		return entries.map(Number);
	} else if (elementValidator instanceof z.ZodBoolean) {
		return entries.map(Boolean);
	}
	return entries;
}

function handleFormDataGet(
	key: string,
	formData: FormData,
	validator: unknown,
	baseValidator: unknown,
) {
	const value = formData.get(key);
	if (!value) {
		return baseValidator instanceof z.ZodOptional ? undefined : null;
	}
	return validator instanceof z.ZodNumber ? Number(value) : value;
}

function unwrapBaseObjectSchema(schema: z.ZodType, unparsedInput: FormData) {
	while (schema instanceof z.ZodEffects || schema instanceof z.ZodPipeline) {
		if (schema instanceof z.ZodEffects) {
			schema = schema._def.schema;
		}
		if (schema instanceof z.ZodPipeline) {
			schema = schema._def.in;
		}
	}
	if (schema instanceof z.ZodDiscriminatedUnion) {
		const typeKey = schema._def.discriminator;
		const typeValue = unparsedInput.get(typeKey);
		if (typeof typeValue !== 'string') return schema;

		const objSchema = schema._def.optionsMap.get(typeValue);
		if (!objSchema) return schema;

		return objSchema;
	}
	return schema;
}

/**
 * Access information about Action requests from middleware.
 */
export function getActionContext(context: APIContext) {
	const callerInfo = getCallerInfo(context);

	// Prevents action results from being handled on a rewrite.
	// Also prevents our *own* fallback middleware from running
	// if the user's middleware has already handled the result.
	const actionResultAlreadySet = Boolean((context.locals as Locals)._actionPayload);

	let action:
		| {
				/** Whether an action was called using an RPC function or by using an HTML form action. */
				calledFrom: 'rpc' | 'form-action';
				/** The name of the action. Useful to track the source of an action result during a redirect. */
				name: string;
				/** Programatically call the action to get the result. */
				handler: () => Promise<SafeResult<any, any>>;
		  }
		| undefined = undefined;

	if (callerInfo && context.request.method === 'POST' && !actionResultAlreadySet) {
		const contentType = context.request.headers.get('content-type');
		const contentLength = context.request.headers.get('Content-Length');

		action = {
			calledFrom: callerInfo.from,
			name: callerInfo.name,
			handler: async () => {
				const baseAction = await getAction(callerInfo.name);
				let input: unknown = undefined;

				if (!contentType || contentLength === '0') {
					input = undefined;
				} else if (contentType && hasContentType(contentType, formContentTypes)) {
					input = await context.request.clone().formData();
				} else if (contentType && hasContentType(contentType, ['application/json'])) {
					input = await context.request.clone().json();
				} else {
					return { data: undefined, error: new ActionError({ code: 'UNSUPPORTED_MEDIA_TYPE' }) };
				}
				const handler = baseAction.bind(context);
				return handler(input);
			},
		};
	}

	/**
	 * Manually set the action result accessed via `getActionResult()`.
	 * Calling this function from middleware will disable Astro's own action result handling.
	 */
	function setActionResult(actionName: string, actionResult: SerializedActionResult) {
		(context.locals as Locals)._actionPayload = {
			actionResult,
			actionName,
		};
	}
	return {
		action,
		setActionResult,
		serializeActionResult,
		deserializeActionResult,
	};
}

function getCallerInfo(ctx: APIContext) {
	if (ctx.routePattern === '/_actions/[...path]') {
		return { from: 'rpc', name: ctx.url.pathname.replace(/^.*\/_actions\//, '') } as const;
	}
	const queryParam = ctx.url.searchParams.get(ACTION_QUERY_PARAMS.actionName);
	if (queryParam) {
		return { from: 'form-action', name: queryParam } as const;
	}
	return undefined;
}

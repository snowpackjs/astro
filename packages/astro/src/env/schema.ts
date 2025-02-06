import { z } from 'zod';

const StringSchema = z.object({
	type: z.literal('string'),
	optional: z.boolean().optional(),
	default: z.string().optional(),
	max: z.number().optional(),
	min: z.number().min(0).optional(),
	length: z.number().optional(),
	url: z.boolean().optional(),
	includes: z.string().optional(),
	startsWith: z.string().optional(),
	endsWith: z.string().optional(),
});
export type StringSchema = z.infer<typeof StringSchema>;
const NumberSchema = z.object({
	type: z.literal('number'),
	optional: z.boolean().optional(),
	default: z.number().optional(),
	gt: z.number().optional(),
	min: z.number().optional(),
	lt: z.number().optional(),
	max: z.number().optional(),
	int: z.boolean().optional(),
});
export type NumberSchema = z.infer<typeof NumberSchema>;
const BooleanSchema = z.object({
	type: z.literal('boolean'),
	optional: z.boolean().optional(),
	default: z.boolean().optional(),
});
const EnumSchema = z.object({
	type: z.literal('enum'),
	values: z.array(
		// We use "'" for codegen so it can't be passed here
		z
			.string()
			.refine((v) => !v.includes("'"), {
				message: `The "'" character can't be used as an enum value`,
			}),
	),
	optional: z.boolean().optional(),
	default: z.string().optional(),
});
export type EnumSchema = z.infer<typeof EnumSchema>;

const EnvFieldType = z.union([
	StringSchema,
	NumberSchema,
	BooleanSchema,
	EnumSchema.superRefine((schema, ctx) => {
		if (schema.default) {
			if (!schema.values.includes(schema.default)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `The default value "${
						schema.default
					}" must be one of the specified values: ${schema.values.join(', ')}.`,
				});
			}
		}
	}),
]);
export type EnvFieldType = z.infer<typeof EnvFieldType>;

const PublicClientEnvFieldMetadata = z.object({
	context: z.literal('client'),
	access: z.literal('public'),
});
const PublicServerEnvFieldMetadata = z.object({
	context: z.literal('server'),
	access: z.literal('public'),
});
const SecretServerEnvFieldMetadata = z.object({
	context: z.literal('server'),
	access: z.literal('secret'),
});
const _EnvFieldMetadata = z.union([
	PublicClientEnvFieldMetadata,
	PublicServerEnvFieldMetadata,
	SecretServerEnvFieldMetadata,
]);
const EnvFieldMetadata = z.custom<z.input<typeof _EnvFieldMetadata>>().superRefine((data, ctx) => {
	const result = _EnvFieldMetadata.safeParse(data);
	if (result.success) {
		return;
	}
	for (const issue of result.error.issues) {
		if (issue.code === z.ZodIssueCode.invalid_union) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `**Invalid combination** of "access" and "context" options:\n  Secret client variables are not supported. Please review the configuration of \`env.schema.${ctx.path.at(-1)}\`.\n  Learn more at https://docs.astro.build/en/guides/environment-variables/#variable-types`,
				path: ['context', 'access'],
			});
		} else {
			ctx.addIssue(issue);
		}
	}
});

const EnvSchemaKey = z
	.string()
	.min(1)
	.refine(([firstChar]) => isNaN(Number.parseInt(firstChar)), {
		message: 'A valid variable name cannot start with a number.',
	})
	.refine((str) => /^[A-Z0-9_]+$/.test(str), {
		message: 'A valid variable name can only contain uppercase letters, numbers and underscores.',
	});

export const EnvSchema = z.record(EnvSchemaKey, z.intersection(EnvFieldMetadata, EnvFieldType));

// https://www.totaltypescript.com/concepts/the-prettify-helper
type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type EnvSchema = z.infer<typeof EnvSchema>;

type _Field<T extends z.ZodType> = Prettify<z.infer<typeof EnvFieldMetadata & T>>;
type _FieldInput<T extends z.ZodType, TKey extends string = 'type'> = Prettify<
	z.infer<typeof EnvFieldMetadata> & Omit<z.infer<T>, TKey>
>;

export type StringField = _Field<typeof StringSchema>;
export type StringFieldInput = _FieldInput<typeof StringSchema>;

export type NumberField = _Field<typeof NumberSchema>;
export type NumberFieldInput = _FieldInput<typeof NumberSchema>;

export type BooleanField = _Field<typeof BooleanSchema>;
export type BooleanFieldInput = _FieldInput<typeof BooleanSchema>;

export type EnumField = _Field<typeof EnumSchema>;
export type EnumFieldInput<T extends string> = Prettify<
	_FieldInput<typeof EnumSchema, 'type' | 'values' | 'default'> & {
		values: Array<T>;
		default?: NoInfer<T> | undefined;
	}
>;

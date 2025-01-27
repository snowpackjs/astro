import type {
	BooleanField,
	BooleanFieldInput,
	EnumField,
	EnumFieldInput,
	NumberField,
	NumberFieldInput,
	StringField,
	StringFieldInput,
} from './schema.js';

/**
 * Return a valid env field to use in this Astro config for `env.schema`.
 */
export const envField = {
	string: (options: StringFieldInput): StringField => ({
		...options,
		type: 'string',
	}),
	number: (options: NumberFieldInput): NumberField => ({
		...options,
		type: 'number',
	}),
	boolean: (options: BooleanFieldInput): BooleanField => ({
		...options,
		type: 'boolean',
	}),
	enum: <T extends string>(options: EnumFieldInput<T>): EnumField => ({
		...options,
		type: 'enum',
	}),
};

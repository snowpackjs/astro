import type { EnumSchema, EnvFieldType, NumberSchema, StringSchema } from './schema.js';

export type ValidationResultValue = EnvFieldType['default'];
export type ValidationResultErrors = ['missing'] | ['type'] | Array<string>;
interface ValidationResultValid {
	ok: true;
	value: ValidationResultValue;
}
export interface ValidationResultInvalid {
	ok: false;
	errors: ValidationResultErrors;
}
type ValidationResult = ValidationResultValid | ValidationResultInvalid;

export function getEnvFieldType(options: EnvFieldType) {
	const optional = options.optional ? (options.default !== undefined ? false : true) : false;

	let type: string;
	if (options.type === 'enum') {
		type = options.values.map((v) => `'${v}'`).join(' | ');
	} else {
		type = options.type;
	}

	return `${type}${optional ? ' | undefined' : ''}`;
}

type ValueValidator = (input: string | undefined) => ValidationResult;

const stringValidator =
	({ max, min, length, url, includes, startsWith, endsWith }: StringSchema): ValueValidator =>
	(input) => {
		if (typeof input !== 'string') {
			return {
				ok: false,
				errors: ['type'],
			};
		}
		const errors: Array<string> = [];

		if (max !== undefined && !(input.length <= max)) {
			errors.push('max');
		}
		if (min !== undefined && !(input.length >= min)) {
			errors.push('min');
		}
		if (length !== undefined && !(input.length === length)) {
			errors.push('length');
		}
		if (url !== undefined && !URL.canParse(input)) {
			errors.push('url');
		}
		if (includes !== undefined && !input.includes(includes)) {
			errors.push('includes');
		}
		if (startsWith !== undefined && !input.startsWith(startsWith)) {
			errors.push('startsWith');
		}
		if (endsWith !== undefined && !input.endsWith(endsWith)) {
			errors.push('endsWith');
		}

		if (errors.length > 0) {
			return {
				ok: false,
				errors,
			};
		}
		return {
			ok: true,
			value: input,
		};
	};

const numberValidator =
	({ gt, min, lt, max, int }: NumberSchema): ValueValidator =>
	(input) => {
		const num = parseFloat(input ?? '');
		if (isNaN(num)) {
			return {
				ok: false,
				errors: ['type'],
			};
		}
		const errors: Array<string> = [];

		if (gt !== undefined && !(num > gt)) {
			errors.push('gt');
		}
		if (min !== undefined && !(num >= min)) {
			errors.push('min');
		}
		if (lt !== undefined && !(num < lt)) {
			errors.push('lt');
		}
		if (max !== undefined && !(num <= max)) {
			errors.push('max');
		}
		if (int !== undefined) {
			const isInt = Number.isInteger(num);
			if (!(int ? isInt : !isInt)) {
				errors.push('int');
			}
		}

		if (errors.length > 0) {
			return {
				ok: false,
				errors,
			};
		}
		return {
			ok: true,
			value: num,
		};
	};

const booleanValidator: ValueValidator = (input) => {
	const bool = input === 'true' ? true : input === 'false' ? false : undefined;
	if (typeof bool !== 'boolean') {
		return {
			ok: false,
			errors: ['type'],
		};
	}
	return {
		ok: true,
		value: bool,
	};
};

const enumValidator =
	({ values }: EnumSchema): ValueValidator =>
	(input) => {
		if (!(typeof input === 'string' ? values.includes(input) : false)) {
			return {
				ok: false,
				errors: ['type'],
			};
		}
		return {
			ok: true,
			value: input,
		};
	};

function selectValidator(options: EnvFieldType): ValueValidator {
	switch (options.type) {
		case 'string':
			return stringValidator(options);
		case 'number':
			return numberValidator(options);
		case 'boolean':
			return booleanValidator;
		case 'enum':
			return enumValidator(options);
	}
}

export function validateEnvVariable(
	value: string | undefined,
	options: EnvFieldType,
): ValidationResult {
	const isOptional = options.optional || options.default !== undefined;
	if (isOptional && value === undefined) {
		return {
			ok: true,
			value: options.default,
		};
	}
	if (!isOptional && value === undefined) {
		return {
			ok: false,
			errors: ['missing'],
		};
	}

	return selectValidator(options)(value);
}

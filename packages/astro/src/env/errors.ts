import type { ValidationResultErrors } from './validators.js';

export interface InvalidVariable {
	key: string;
	type: string;
	errors: ValidationResultErrors;
}

export function invalidVariablesToError(invalid: Array<InvalidVariable>) {
	const _errors: Array<string> = [];
	for (const { key, type, errors } of invalid) {
		if (errors[0] === 'missing') {
			_errors.push(`${key} is missing`);
		} else if (errors[0] === 'type') {
			_errors.push(`${key}'s type is invalid, expected: ${type}`);
		} else {
			// constraints
			_errors.push(`The following constraints for ${key} are not met: ${errors.join(', ')}`);
		}
	}
	return _errors;
}

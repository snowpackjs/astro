import { AstroError, AstroErrorData } from '../core/errors/index.js';
import { invalidVariablesToError } from './errors.js';
import type { ValidationResultInvalid } from './validators.js';
export { validateEnvVariable, getEnvFieldType } from './validators.js';

export type GetEnv = (key: string) => string | undefined;
type OnSetGetEnv = () => void;

let _getEnv: GetEnv = (key) => process.env[key];

export function setGetEnv(fn: GetEnv) {
	_getEnv = fn;

	_onSetGetEnv();
}

let _onSetGetEnv: OnSetGetEnv = () => {};

export function setOnSetGetEnv(fn: OnSetGetEnv) {
	_onSetGetEnv = fn;
}

export function getEnv(...args: Parameters<GetEnv>) {
	return _getEnv(...args);
}

export function createInvalidVariablesError(
	key: string,
	type: string,
	result: ValidationResultInvalid,
) {
	return new AstroError({
		...AstroErrorData.EnvInvalidVariables,
		message: AstroErrorData.EnvInvalidVariables.message(
			invalidVariablesToError([{ key, type, errors: result.errors }]),
		),
	});
}

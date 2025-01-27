// @ts-check
import { schema } from 'virtual:astro:env/internal';
import {
	// biome-ignore lint/correctness/noUnusedImports: `_getEnv` is used by the generated code
	getEnv as _getEnv,
	createInvalidVariablesError,
	getEnvFieldType,
	setOnSetGetEnv,
	validateEnvVariable,
} from 'astro/env/runtime';

// @ts-expect-error
/** @returns {string} */
// used while generating the virtual module
// biome-ignore lint/correctness/noUnusedFunctionParameters: `key` is used by the generated code
// biome-ignore lint/correctness/noUnusedVariables: `key` is used by the generated code
const getEnv = (key) => {
	// @@GET_ENV@@
};

export const getSecret = (key) => {
	return getEnv(key);
};

const _internalGetSecret = (key) => {
	const rawVariable = getEnv(key);
	const variable = rawVariable === '' ? undefined : rawVariable;
	const options = schema[key];

	const result = validateEnvVariable(variable, options);
	if (result.ok) {
		return result.value;
	}
	const type = getEnvFieldType(options);
	throw createInvalidVariablesError(key, type, result);
};

setOnSetGetEnv(() => {
	// @@ON_SET_GET_ENV@@
});

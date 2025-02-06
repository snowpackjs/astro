import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { AstroError, AstroErrorData } from '../core/errors/index.js';
import type { AstroSettings } from '../types/astro.js';
import {
	MODULE_TEMPLATE_URL,
	VIRTUAL_MODULES_IDS,
	VIRTUAL_MODULES_IDS_VALUES,
} from './constants.js';
import type { EnvLoader } from './env-loader.js';
import { type InvalidVariable, invalidVariablesToError } from './errors.js';
import type { EnvSchema } from './schema.js';
import { getEnvFieldType, validateEnvVariable } from './validators.js';

interface AstroEnvPluginParams {
	settings: AstroSettings;
	sync: boolean;
	envLoader: EnvLoader;
}

export function astroEnv({ settings, sync, envLoader }: AstroEnvPluginParams): Plugin {
	const { schema, validateSecrets } = settings.config.env;
	let isDev: boolean;

	let templates: { client: string; server: string; internal: string } | null = null;

	function ensureTemplateAreLoaded() {
		if (templates !== null) {
			return;
		}

		const loadedEnv = envLoader.get();

		if (!isDev) {
			for (const [key, value] of Object.entries(loadedEnv)) {
				if (value !== undefined) {
					process.env[key] = value;
				}
			}
		}

		const validatedVariables = validatePublicVariables({
			schema,
			loadedEnv,
			validateSecrets,
			sync,
		});

		templates = {
			...getTemplates(schema, validatedVariables, isDev ? loadedEnv : null),
			internal: `export const schema = ${JSON.stringify(schema)};`,
		};
	}

	return {
		name: 'astro-env-plugin',
		enforce: 'pre',
		config(_, { command }) {
			isDev = command !== 'build';
		},
		buildStart() {
			ensureTemplateAreLoaded();
		},
		buildEnd() {
			templates = null;
		},
		resolveId(id) {
			if (VIRTUAL_MODULES_IDS_VALUES.has(id)) {
				return resolveVirtualModuleId(id);
			}
		},
		load(id, options) {
			if (id === resolveVirtualModuleId(VIRTUAL_MODULES_IDS.client)) {
				ensureTemplateAreLoaded();
				return templates!.client;
			}
			if (id === resolveVirtualModuleId(VIRTUAL_MODULES_IDS.server)) {
				if (options?.ssr) {
					ensureTemplateAreLoaded();
					return templates!.server;
				}
				throw new AstroError({
					...AstroErrorData.ServerOnlyModule,
					message: AstroErrorData.ServerOnlyModule.message(VIRTUAL_MODULES_IDS.server),
				});
			}
			if (id === resolveVirtualModuleId(VIRTUAL_MODULES_IDS.internal)) {
				ensureTemplateAreLoaded();
				return templates!.internal;
			}
		},
	};
}

function resolveVirtualModuleId<T extends string>(id: T): `\0${T}` {
	return `\0${id}`;
}

function validatePublicVariables({
	schema,
	loadedEnv,
	validateSecrets,
	sync,
}: {
	schema: EnvSchema;
	loadedEnv: Record<string, string>;
	validateSecrets: boolean;
	sync: boolean;
}) {
	const valid: Array<{ key: string; value: any; type: string; context: 'server' | 'client' }> = [];
	const invalid: Array<InvalidVariable> = [];

	for (const [key, options] of Object.entries(schema)) {
		const variable = loadedEnv[key] === '' ? undefined : loadedEnv[key];

		if (options.access === 'secret' && !validateSecrets) {
			continue;
		}

		const result = validateEnvVariable(variable, options);
		const type = getEnvFieldType(options);
		if (!result.ok) {
			invalid.push({ key, type, errors: result.errors });
			// We don't do anything with validated secrets so we don't store them
		} else if (options.access === 'public') {
			valid.push({ key, value: result.value, type, context: options.context });
		}
	}

	if (invalid.length > 0 && !sync) {
		throw new AstroError({
			...AstroErrorData.EnvInvalidVariables,
			message: AstroErrorData.EnvInvalidVariables.message(invalidVariablesToError(invalid)),
		});
	}

	return valid;
}

function getTemplates(
	schema: EnvSchema,
	validatedVariables: ReturnType<typeof validatePublicVariables>,
	loadedEnv: Record<string, string> | null,
) {
	let client = '';
	let server = readFileSync(MODULE_TEMPLATE_URL, 'utf-8');
	let onSetGetEnv = '';

	for (const { key, value, context } of validatedVariables) {
		const str = `export const ${key} = ${JSON.stringify(value)};`;
		if (context === 'client') {
			client += str;
		} else {
			server += str;
		}
	}

	for (const [key, options] of Object.entries(schema)) {
		if (!(options.context === 'server' && options.access === 'secret')) {
			continue;
		}

		server += `export let ${key} = _internalGetSecret(${JSON.stringify(key)});\n`;
		onSetGetEnv += `${key} = _internalGetSecret(${JSON.stringify(key)});\n`;
	}

	server = server.replace('// @@ON_SET_GET_ENV@@', onSetGetEnv);
	if (loadedEnv) {
		server = server.replace('// @@GET_ENV@@', `return (${JSON.stringify(loadedEnv)})[key];`);
	} else {
		server = server.replace('// @@GET_ENV@@', 'return _getEnv(key);');
	}

	return {
		client,
		server,
	};
}

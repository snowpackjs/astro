import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
	TSConfckParseError,
	type TSConfckParseOptions,
	type TSConfckParseResult,
	find,
	parse,
	toJson,
} from 'tsconfck';
import type { CompilerOptions, TypeAcquisition } from 'typescript';

export const defaultTSConfig: TSConfig = { extends: 'astro/tsconfigs/base' };

export type frameworkWithTSSettings = 'vue' | 'react' | 'preact' | 'solid-js';
// The following presets unfortunately cannot be inside the specific integrations, as we need
// them even in cases where the integrations are not installed
export const presets = new Map<frameworkWithTSSettings, TSConfig>([
	[
		'vue', // Settings needed for template intellisense when using Volar
		{
			compilerOptions: {
				jsx: 'preserve',
			},
		},
	],
	[
		'react', // Default TypeScript settings, but we need to redefine them in case the users changed them previously
		{
			compilerOptions: {
				jsx: 'react-jsx',
				jsxImportSource: 'react',
			},
		},
	],
	[
		'preact', // https://preactjs.com/guide/v10/typescript/#typescript-configuration
		{
			compilerOptions: {
				jsx: 'react-jsx',
				jsxImportSource: 'preact',
			},
		},
	],
	[
		'solid-js', // https://www.solidjs.com/guides/typescript#configuring-typescript
		{
			compilerOptions: {
				jsx: 'preserve',
				jsxImportSource: 'solid-js',
			},
		},
	],
]);

type TSConfigResult<T = object> = Promise<
	(TSConfckParseResult & T) | 'invalid-config' | 'missing-config' | 'unknown-error'
>;

/**
 * Load a tsconfig.json or jsconfig.json is the former is not found
 * @param root The root directory to search in, defaults to `process.cwd()`.
 * @param findUp Whether to search for the config file in parent directories, by default only the root directory is searched.
 */
export async function loadTSConfig(
	root: string | undefined,
	findUp = false,
): Promise<TSConfigResult<{ rawConfig: TSConfig }>> {
	const safeCwd = root ?? process.cwd();

	const [jsconfig, tsconfig] = await Promise.all(
		['jsconfig.json', 'tsconfig.json'].map((configName) =>
			// `tsconfck` expects its first argument to be a file path, not a directory path, so we'll fake one
			find(join(safeCwd, './dummy.txt'), {
				root: findUp ? undefined : root,
				configName: configName,
			}),
		),
	);

	// If we have both files, prefer tsconfig.json
	if (tsconfig) {
		const parsedConfig = await safeParse(tsconfig, { root: root });

		if (typeof parsedConfig === 'string') {
			return parsedConfig;
		}

		// tsconfck does not return the original config, so we need to parse it ourselves
		// https://github.com/dominikg/tsconfck/issues/138
		const rawConfig = await readFile(tsconfig, 'utf-8')
			.then(toJson)
			.then((content) => JSON.parse(content) as TSConfig);

		return { ...parsedConfig, rawConfig };
	}

	if (jsconfig) {
		const parsedConfig = await safeParse(jsconfig, { root: root });

		if (typeof parsedConfig === 'string') {
			return parsedConfig;
		}

		const rawConfig = await readFile(jsconfig, 'utf-8')
			.then(toJson)
			.then((content) => JSON.parse(content) as TSConfig);

		return { ...parsedConfig, rawConfig: rawConfig };
	}

	return 'missing-config';
}

async function safeParse(tsconfigPath: string, options: TSConfckParseOptions = {}): TSConfigResult {
	try {
		const parseResult = await parse(tsconfigPath, options);

		if (parseResult.tsconfig == null) {
			return 'missing-config';
		}

		return parseResult;
	} catch (e) {
		if (e instanceof TSConfckParseError) {
			return 'invalid-config';
		}

		return 'unknown-error';
	}
}

export function updateTSConfigForFramework(
	target: TSConfig,
	framework: frameworkWithTSSettings,
): TSConfig {
	if (!presets.has(framework)) {
		return target;
	}

	return deepMergeObjects(target, presets.get(framework)!);
}

// Simple deep merge implementation that merges objects and strings
function deepMergeObjects<T extends Record<string, any>>(a: T, b: T): T {
	const merged: T = { ...a };

	for (const key in b) {
		const value = b[key];

		if (a[key] == null) {
			merged[key] = value;
			continue;
		}

		if (typeof a[key] === 'object' && typeof value === 'object') {
			merged[key] = deepMergeObjects(a[key], value);
			continue;
		}

		merged[key] = value;
	}

	return merged;
}

// The code below is adapted from `pkg-types`
// `pkg-types` offer more types and utilities, but since we only want the TSConfig type, we'd rather avoid adding a dependency.
// https://github.com/unjs/pkg-types/blob/78328837d369d0145a8ddb35d7fe1fadda4bfadf/src/types/tsconfig.ts
// See https://github.com/unjs/pkg-types/blob/78328837d369d0145a8ddb35d7fe1fadda4bfadf/LICENSE for license information

export type StripEnums<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends boolean
		? T[K]
		: T[K] extends string
			? T[K]
			: T[K] extends object
				? T[K]
				: T[K] extends Array<any>
					? T[K]
					: T[K] extends undefined
						? undefined
						: any;
};

export interface TSConfig {
	compilerOptions?: StripEnums<CompilerOptions>;
	compileOnSave?: boolean;
	extends?: string;
	files?: string[];
	include?: string[];
	exclude?: string[];
	typeAcquisition?: TypeAcquisition;
}

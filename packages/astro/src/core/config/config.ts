import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as colors from 'kleur/colors';
import { ZodError } from 'zod';
import { eventConfigError, telemetry } from '../../events/index.js';
import type {
	AstroConfig,
	AstroInlineConfig,
	AstroInlineOnlyConfig,
	AstroUserConfig,
} from '../../types/public/config.js';
import { trackAstroConfigZodError } from '../errors/errors.js';
import { AstroError, AstroErrorData } from '../errors/index.js';
import { formatConfigErrorMessage } from '../messages.js';
import { mergeConfig } from './merge.js';
import { validateConfig } from './validate.js';
import { loadConfigWithVite } from './vite-load.js';

export function resolveRoot(cwd?: string | URL): string {
	if (cwd instanceof URL) {
		cwd = fileURLToPath(cwd);
	}
	return cwd ? path.resolve(cwd) : process.cwd();
}

// Config paths to search for. In order of likely appearance
// to speed up the check.
export const configPaths = Object.freeze([
	'astro.config.mjs',
	'astro.config.js',
	'astro.config.ts',
	'astro.config.mts',
	'astro.config.cjs',
	'astro.config.cts',
]);

async function search(fsMod: typeof fs, root: string) {
	const paths = configPaths.map((p) => path.join(root, p));

	for (const file of paths) {
		if (fsMod.existsSync(file)) {
			return file;
		}
	}
}

interface ResolveConfigPathOptions {
	root: string;
	configFile?: string | false;
	fs: typeof fs;
}

/**
 * Resolve the file URL of the user's `astro.config.js|cjs|mjs|ts` file
 */
export async function resolveConfigPath(
	options: ResolveConfigPathOptions,
): Promise<string | undefined> {
	let userConfigPath: string | undefined;
	if (options.configFile) {
		userConfigPath = path.join(options.root, options.configFile);
		if (!options.fs.existsSync(userConfigPath)) {
			throw new AstroError({
				...AstroErrorData.ConfigNotFound,
				message: AstroErrorData.ConfigNotFound.message(options.configFile),
			});
		}
	} else {
		userConfigPath = await search(options.fs, options.root);
	}

	return userConfigPath;
}

async function loadConfig(
	root: string,
	configFile?: string | false,
	fsMod = fs,
): Promise<Record<string, any>> {
	if (configFile === false) return {};

	const configPath = await resolveConfigPath({
		root,
		configFile,
		fs: fsMod,
	});
	if (!configPath) return {};

	// Create a vite server to load the config
	try {
		return await loadConfigWithVite({
			root,
			configPath,
			fs: fsMod,
		});
	} catch (e) {
		const configPathText = configFile ? colors.bold(configFile) : 'your Astro config';
		// Config errors should bypass log level as it breaks startup
		console.error(`${colors.bold(colors.red('[astro]'))} Unable to load ${configPathText}\n`);
		throw e;
	}
}

/**
 * `AstroInlineConfig` is a union of `AstroUserConfig` and `AstroInlineOnlyConfig`.
 * This functions splits it up.
 */
function splitInlineConfig(inlineConfig: AstroInlineConfig): {
	inlineUserConfig: AstroUserConfig;
	inlineOnlyConfig: AstroInlineOnlyConfig;
} {
	const { configFile, mode, logLevel, ...inlineUserConfig } = inlineConfig;
	return {
		inlineUserConfig,
		inlineOnlyConfig: {
			configFile,
			mode,
			logLevel,
		},
	};
}

interface ResolveConfigResult {
	userConfig: AstroUserConfig;
	astroConfig: AstroConfig;
}

/**
 * Resolves the Astro config with a given inline config.
 *
 * @param inlineConfig An inline config that takes highest priority when merging and resolving the final config.
 * @param command The running command that uses this config. Usually 'dev' or 'build'.
 */
export async function resolveConfig(
	inlineConfig: AstroInlineConfig,
	command: string,
	fsMod = fs,
): Promise<ResolveConfigResult> {
	const root = resolveRoot(inlineConfig.root);
	const { inlineUserConfig, inlineOnlyConfig } = splitInlineConfig(inlineConfig);

	// If the root is specified, assign the resolved path so it takes the highest priority
	if (inlineConfig.root) {
		inlineUserConfig.root = root;
	}

	const userConfig = await loadConfig(root, inlineOnlyConfig.configFile, fsMod);
	const mergedConfig = mergeConfig(userConfig, inlineUserConfig);
	// First-Pass Validation
	let astroConfig: AstroConfig;
	try {
		astroConfig = await validateConfig(mergedConfig, root, command);
	} catch (e) {
		// Improve config zod error messages
		if (e instanceof ZodError) {
			// Mark this error so the callee can decide to suppress Zod's error if needed.
			// We still want to throw the error to signal an error in validation.
			trackAstroConfigZodError(e);
			console.error(formatConfigErrorMessage(e) + '\n');
			telemetry.record(eventConfigError({ cmd: command, err: e, isFatal: true }));
		}
		throw e;
	}

	return { userConfig: mergedConfig, astroConfig };
}

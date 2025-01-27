import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import type { AstroConfig } from '../types/public/index.js';

// Match valid JS variable names (identifiers), which accepts most alphanumeric characters,
// except that the first character cannot be a number.
const isValidIdentifierRe = /^[_$a-zA-Z][\w$]*$/;

function getPrivateEnv(
	fullEnv: Record<string, string>,
	astroConfig: AstroConfig,
): Record<string, string> {
	const viteConfig = astroConfig.vite;
	let envPrefixes: string[] = ['PUBLIC_'];
	if (viteConfig.envPrefix) {
		envPrefixes = Array.isArray(viteConfig.envPrefix)
			? viteConfig.envPrefix
			: [viteConfig.envPrefix];
	}

	const privateEnv: Record<string, string> = {};
	for (const key in fullEnv) {
		// Ignore public env var
		if (isValidIdentifierRe.test(key) && envPrefixes.every((prefix) => !key.startsWith(prefix))) {
			if (typeof process.env[key] !== 'undefined') {
				let value = process.env[key];
				// Replacements are always strings, so try to convert to strings here first
				if (typeof value !== 'string') {
					value = `${value}`;
				}
				// Boolean values should be inlined to support `export const prerender`
				// We already know that these are NOT sensitive values, so inlining is safe
				if (value === '0' || value === '1' || value === 'true' || value === 'false') {
					privateEnv[key] = value;
				} else {
					privateEnv[key] = `process.env.${key}`;
				}
			} else {
				privateEnv[key] = JSON.stringify(fullEnv[key]);
			}
		}
	}
	return privateEnv;
}

export const createEnvLoader = (mode: string, config: AstroConfig) => {
	const loaded = loadEnv(mode, config.vite.envDir ?? fileURLToPath(config.root), '');
	const privateEnv = getPrivateEnv(loaded, config);
	return {
		get: () => loaded,
		getPrivateEnv: () => privateEnv,
	};
};

export type EnvLoader = ReturnType<typeof createEnvLoader>;

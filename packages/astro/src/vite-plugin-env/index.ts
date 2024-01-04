import { fileURLToPath } from 'node:url';
import type * as vite from 'vite';
import { loadEnv } from 'vite';
import { transform } from 'esbuild';
import type { AstroConfig, AstroSettings } from '../@types/astro.js';

interface EnvPluginOptions {
	settings: AstroSettings;
}

const importMetaEnvOnlyRe = /import\.meta\.env\b(?!\.)/;

function getPrivateEnv(
	viteConfig: vite.ResolvedConfig,
	astroConfig: AstroConfig
): Record<string, string> {
	let envPrefixes: string[] = ['PUBLIC_'];
	if (viteConfig.envPrefix) {
		envPrefixes = Array.isArray(viteConfig.envPrefix)
			? viteConfig.envPrefix
			: [viteConfig.envPrefix];
	}

	// Loads environment variables from `.env` files and `process.env`
	const fullEnv = loadEnv(
		viteConfig.mode,
		viteConfig.envDir ?? fileURLToPath(astroConfig.root),
		''
	);

	const privateEnv: Record<string, string> = {};
	for (const key in fullEnv) {
		// Ignore public env var
		if (envPrefixes.every((prefix) => !key.startsWith(prefix))) {
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
	privateEnv.SITE = astroConfig.site ? JSON.stringify(astroConfig.site) : 'undefined';
	privateEnv.SSR = JSON.stringify(true);
	privateEnv.BASE_URL = astroConfig.base ? JSON.stringify(astroConfig.base) : 'undefined';
	privateEnv.ASSETS_PREFIX = astroConfig.build.assetsPrefix
		? JSON.stringify(astroConfig.build.assetsPrefix)
		: 'undefined';
	return privateEnv;
}

function getReferencedPrivateKeys(source: string, privateEnv: Record<string, any>): Set<string> {
	const references = new Set<string>();
	for (const key in privateEnv) {
		if (source.includes(key)) {
			references.add(key);
		}
	}
	return references;
}

/**
 * Use esbuild to perform replacememts like Vite
 * https://github.com/vitejs/vite/blob/5ea9edbc9ceb991e85f893fe62d68ed028677451/packages/vite/src/node/plugins/define.ts#L130
 */
async function replaceDefine(
	code: string,
	id: string,
	define: Record<string, string>,
	config: vite.ResolvedConfig
): Promise<{ code: string; map: string | null }> {
	const esbuildOptions = config.esbuild || {};

	const result = await transform(code, {
		loader: 'js',
		charset: esbuildOptions.charset ?? 'utf8',
		platform: 'neutral',
		define,
		sourcefile: id,
		sourcemap: config.command === 'build' ? !!config.build.sourcemap : true,
	});

	return {
		code: result.code,
		map: result.map || null,
	};
}

export default function envVitePlugin({ settings }: EnvPluginOptions): vite.Plugin {
	let privateEnv: Record<string, string>;
	let defaultDefines: Record<string, string>;
	let viteConfig: vite.ResolvedConfig;
	const { config: astroConfig } = settings;
	return {
		name: 'astro:vite-plugin-env',
		config() {
			return {
				define: {
					'import.meta.env.BASE_URL': astroConfig.base
						? JSON.stringify(astroConfig.base)
						: 'undefined',
					'import.meta.env.ASSETS_PREFIX': astroConfig.build.assetsPrefix
						? JSON.stringify(astroConfig.build.assetsPrefix)
						: 'undefined',
				},
			};
		},
		configResolved(resolvedConfig) {
			viteConfig = resolvedConfig;

			// HACK: move ourselves before Vite's define plugin to apply replacements at the right time (before Vite normal plugins)
			const viteDefinePluginIndex = resolvedConfig.plugins.findIndex(
				(p) => p.name === 'vite:define'
			);
			if (viteDefinePluginIndex !== -1) {
				const myPluginIndex = resolvedConfig.plugins.findIndex(
					(p) => p.name === 'astro:vite-plugin-env'
				);
				if (myPluginIndex !== -1) {
					const myPlugin = resolvedConfig.plugins[myPluginIndex];
					// @ts-ignore-error ignore readonly annotation
					resolvedConfig.plugins.splice(viteDefinePluginIndex, 0, myPlugin);
					// @ts-ignore-error ignore readonly annotation
					resolvedConfig.plugins.splice(myPluginIndex, 1);
				}
			}
		},
		async transform(source, id, options) {
			if (!options?.ssr || !source.includes('import.meta.env')) {
				return;
			}

			// Find matches for *private* env and do our own replacement.
			privateEnv ??= getPrivateEnv(viteConfig, astroConfig);
			if (!defaultDefines) {
				defaultDefines = {};
				for (const key in privateEnv) {
					defaultDefines[`import.meta.env.${key}`] = privateEnv[key];
				}
			}

			let defines = defaultDefines;

			// If reference the `import.meta.env` object directly, we want to inject private env vars
			// into Vite's injected `import.meta.env` object. To do this, we use `Object.assign` and keeping
			// the `import.meta.env` identifier so Vite sees it.
			// However, since esbuild doesn't support replacing complex expressions, we replace `import.meta.env`
			// with a marker string first, then postprocess and apply the `Object.assign` code.
			let importMetaEnvMarker: string | undefined;
			let importMetaEnvReplacement: string | undefined;
			if (importMetaEnvOnlyRe.test(source)) {
				const references = getReferencedPrivateKeys(source, privateEnv);
				// Create the `Object.assign` code
				importMetaEnvReplacement = `(Object.assign(import.meta.env,{`;
				for (const key of references.values()) {
					importMetaEnvReplacement += `${key}:${privateEnv[key]},`;
				}
				importMetaEnvReplacement += '}))';
				// Compute the marker from the length of the replaced code. We do this so that esbuild generates
				// the sourcemap with the right column offset when we do the postprocessing.
				importMetaEnvMarker = `__astro_import_meta_env${'_'.repeat(
					importMetaEnvReplacement.length - 23 /* length of preceding string */
				)}`;
				defines = {
					...defaultDefines,
					'import.meta.env': importMetaEnvMarker,
				};
			}

			const result = await replaceDefine(source, id, defines, viteConfig);

			if (importMetaEnvMarker) {
				result.code = result.code.replaceAll(importMetaEnvMarker, importMetaEnvReplacement!);
			}

			return result;
		},
	};
}

import { transform } from 'esbuild';
import MagicString from 'magic-string';
import type * as vite from 'vite';
import { createFilter, isCSSRequest } from 'vite';
import type { EnvLoader } from './env-loader.js';

interface EnvPluginOptions {
	envLoader: EnvLoader;
}

// Match `import.meta.env` directly without trailing property access
const importMetaEnvOnlyRe = /\bimport\.meta\.env\b(?!\.)/;

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
	config: vite.ResolvedConfig,
): Promise<{ code: string; map: string | null }> {
	// Since esbuild doesn't support replacing complex expressions, we replace `import.meta.env`
	// with a marker string first, then postprocess and apply the `Object.assign` code.
	const replacementMarkers: Record<string, string> = {};
	const env = define['import.meta.env'];
	if (env) {
		// Compute the marker from the length of the replaced code. We do this so that esbuild generates
		// the sourcemap with the right column offset when we do the postprocessing.
		const marker = `__astro_import_meta_env${'_'.repeat(
			env.length - 23 /* length of preceding string */,
		)}`;
		replacementMarkers[marker] = env;
		define = { ...define, 'import.meta.env': marker };
	}

	const esbuildOptions = config.esbuild || {};

	const result = await transform(code, {
		loader: 'js',
		charset: esbuildOptions.charset ?? 'utf8',
		platform: 'neutral',
		define,
		sourcefile: id,
		sourcemap: config.command === 'build' ? !!config.build.sourcemap : true,
	});

	for (const marker in replacementMarkers) {
		result.code = result.code.replaceAll(marker, replacementMarkers[marker]);
	}

	return {
		code: result.code,
		map: result.map || null,
	};
}

export function importMetaEnv({ envLoader }: EnvPluginOptions): vite.Plugin {
	let privateEnv: Record<string, string>;
	let defaultDefines: Record<string, string>;
	let isDev: boolean;
	let devImportMetaEnvPrepend: string;
	let viteConfig: vite.ResolvedConfig;
	const filter = createFilter(null, ['**/*.html', '**/*.htm', '**/*.json']);
	return {
		name: 'astro:vite-plugin-env',
		config(_, { command }) {
			isDev = command !== 'build';
		},
		configResolved(resolvedConfig) {
			viteConfig = resolvedConfig;

			// HACK: move ourselves before Vite's define plugin to apply replacements at the right time (before Vite normal plugins)
			const viteDefinePluginIndex = resolvedConfig.plugins.findIndex(
				(p) => p.name === 'vite:define',
			);
			if (viteDefinePluginIndex !== -1) {
				const myPluginIndex = resolvedConfig.plugins.findIndex(
					(p) => p.name === 'astro:vite-plugin-env',
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

		transform(source, id, options) {
			if (
				!options?.ssr ||
				!source.includes('import.meta.env') ||
				!filter(id) ||
				isCSSRequest(id) ||
				viteConfig.assetsInclude(id)
			) {
				return;
			}
			// Find matches for *private* env and do our own replacement.
			// Env is retrieved before process.env is populated by astro:env
			// so that import.meta.env is first replaced by values, not process.env
			privateEnv ??= envLoader.getPrivateEnv();

			// In dev, we can assign the private env vars to `import.meta.env` directly for performance
			if (isDev) {
				const s = new MagicString(source);

				if (!devImportMetaEnvPrepend) {
					devImportMetaEnvPrepend = `Object.assign(import.meta.env,{`;
					for (const key in privateEnv) {
						devImportMetaEnvPrepend += `${key}:${privateEnv[key]},`;
					}
					devImportMetaEnvPrepend += '});';
				}
				s.prepend(devImportMetaEnvPrepend);

				return {
					code: s.toString(),
					map: s.generateMap({ hires: 'boundary' }),
				};
			}

			// In build, use esbuild to perform replacements. Compute the default defines for esbuild here as a
			// separate object as it could be extended by `import.meta.env` later.
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
			if (importMetaEnvOnlyRe.test(source)) {
				const references = getReferencedPrivateKeys(source, privateEnv);
				let replacement = `(Object.assign(import.meta.env,{`;
				for (const key of references.values()) {
					replacement += `${key}:${privateEnv[key]},`;
				}
				replacement += '}))';
				defines = {
					...defaultDefines,
					'import.meta.env': replacement,
				};
			}

			return replaceDefine(source, id, defines, viteConfig);
		},
	};
}

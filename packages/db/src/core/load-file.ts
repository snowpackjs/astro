import { existsSync } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { AstroConfig } from 'astro';
import { build as esbuild } from 'esbuild';
import { CONFIG_FILE_NAMES, VIRTUAL_MODULE_ID } from './consts.js';
import { INTEGRATION_TABLE_CONFLICT_ERROR } from './errors.js';
import { errorMap } from './integration/error-map.js';
import { getConfigVirtualModContents } from './integration/vite-plugin-db.js';
import { dbConfigSchema } from './schemas.js';
import './types.js';
import { getAstroEnv, getDbDirectoryUrl } from './utils.js';

/**
 * Load a user’s `astro:db` configuration file and additional configuration files provided by integrations.
 */
export async function resolveDbConfig({
	root,
	integrations,
}: Pick<AstroConfig, 'root' | 'integrations'>) {
	const { mod, dependencies } = await loadUserConfigFile(root);
	const userDbConfig = dbConfigSchema.parse(mod?.default ?? {}, { errorMap });
	/** Resolved `astro:db` config including tables provided by integrations. */
	const dbConfig = { tables: userDbConfig.tables ?? {} };

	// Collect additional config and seed files from integrations.
	const integrationDbConfigPaths: Array<{ name: string; configEntrypoint: string | URL }> = [];
	const integrationSeedPaths: Array<string | URL> = [];
	for (const integration of integrations) {
		const { name, hooks } = integration;
		if (hooks['astro:db:setup']) {
			hooks['astro:db:setup']({
				extendDb({ configEntrypoint, seedEntrypoint }) {
					if (configEntrypoint) {
						integrationDbConfigPaths.push({ name, configEntrypoint });
					}
					if (seedEntrypoint) {
						integrationSeedPaths.push(seedEntrypoint);
					}
				},
			});
		}
	}
	for (const { name, configEntrypoint } of integrationDbConfigPaths) {
		// TODO: config file dependencies are not tracked for integrations for now.
		const loadedConfig = await loadIntegrationConfigFile(root, configEntrypoint);
		const integrationDbConfig = dbConfigSchema.parse(loadedConfig.mod?.default ?? {}, {
			errorMap,
		});
		for (const key in integrationDbConfig.tables) {
			if (key in dbConfig.tables) {
				const isUserConflict = key in (userDbConfig.tables ?? {});
				throw new Error(INTEGRATION_TABLE_CONFLICT_ERROR(name, key, isUserConflict));
			} else {
				dbConfig.tables[key] = integrationDbConfig.tables[key];
			}
		}
	}

	return {
		/** Resolved `astro:db` config, including tables added by integrations. */
		dbConfig,
		/** Dependencies imported into the user config file. */
		dependencies,
		/** Additional `astro:db` seed file paths provided by integrations. */
		integrationSeedPaths,
	};
}

async function loadUserConfigFile(
	root: URL,
): Promise<{ mod: { default?: unknown } | undefined; dependencies: string[] }> {
	let configFileUrl: URL | undefined;
	for (const fileName of CONFIG_FILE_NAMES) {
		const fileUrl = new URL(fileName, getDbDirectoryUrl(root));
		if (existsSync(fileUrl)) {
			configFileUrl = fileUrl;
		}
	}
	return await loadAndBundleDbConfigFile({ root, fileUrl: configFileUrl });
}

export function getResolvedFileUrl(root: URL, filePathOrUrl: string | URL): URL {
	if (typeof filePathOrUrl === 'string') {
		const { resolve } = createRequire(root);
		const resolvedFilePath = resolve(filePathOrUrl);
		return pathToFileURL(resolvedFilePath);
	}
	return filePathOrUrl;
}

async function loadIntegrationConfigFile(root: URL, filePathOrUrl: string | URL) {
	const fileUrl = getResolvedFileUrl(root, filePathOrUrl);
	return await loadAndBundleDbConfigFile({ root, fileUrl });
}

async function loadAndBundleDbConfigFile({
	root,
	fileUrl,
}: {
	root: URL;
	fileUrl: URL | undefined;
}): Promise<{ mod: { default?: unknown } | undefined; dependencies: string[] }> {
	if (!fileUrl) {
		return { mod: undefined, dependencies: [] };
	}
	const { code, dependencies } = await bundleFile({
		virtualModContents: getConfigVirtualModContents(),
		root,
		fileUrl,
	});
	return {
		mod: await importBundledFile({ code, root }),
		dependencies,
	};
}

/**
 * Bundle arbitrary `mjs` or `ts` file.
 * Simplified fork from Vite's `bundleConfigFile` function.
 *
 * @see https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts#L961
 */
export async function bundleFile({
	fileUrl,
	root,
	virtualModContents,
}: {
	fileUrl: URL;
	root: URL;
	virtualModContents: string;
}) {
	const { ASTRO_DATABASE_FILE } = getAstroEnv();
	const result = await esbuild({
		absWorkingDir: process.cwd(),
		entryPoints: [fileURLToPath(fileUrl)],
		outfile: 'out.js',
		packages: 'external',
		write: false,
		target: ['node16'],
		platform: 'node',
		bundle: true,
		format: 'esm',
		sourcemap: 'inline',
		metafile: true,
		define: {
			'import.meta.env.ASTRO_STUDIO_REMOTE_DB_URL': 'undefined',
			'import.meta.env.ASTRO_DB_REMOTE_DB_URL': 'undefined',
			'import.meta.env.ASTRO_DATABASE_FILE': JSON.stringify(ASTRO_DATABASE_FILE ?? ''),
		},
		plugins: [
			{
				name: 'resolve-astro-db',
				setup(build) {
					build.onResolve({ filter: /^astro:db$/ }, ({ path }) => {
						return { path, namespace: VIRTUAL_MODULE_ID };
					});
					build.onLoad({ namespace: VIRTUAL_MODULE_ID, filter: /.*/ }, () => {
						return {
							contents: virtualModContents,
							// Needed to resolve runtime dependencies
							resolveDir: fileURLToPath(root),
						};
					});
				},
			},
		],
	});

	const file = result.outputFiles[0];
	if (!file) {
		throw new Error(`Unexpected: no output file`);
	}

	return {
		code: file.text,
		dependencies: Object.keys(result.metafile.inputs),
	};
}

/**
 * Forked from Vite config loader, replacing CJS-based path concat with ESM only
 *
 * @see https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts#L1074
 */
export async function importBundledFile({
	code,
	root,
}: {
	code: string;
	root: URL;
}): Promise<{ default?: unknown }> {
	// Write it to disk, load it with native Node ESM, then delete the file.
	const tmpFileUrl = new URL(`./db.timestamp-${Date.now()}.mjs`, root);
	await writeFile(tmpFileUrl, code, { encoding: 'utf8' });
	try {
		return await import(/* @vite-ignore */ tmpFileUrl.toString());
	} finally {
		try {
			await unlink(tmpFileUrl);
		} catch {
			// already removed if this function is called twice simultaneously
		}
	}
}

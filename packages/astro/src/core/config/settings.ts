import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { getContentPaths } from '../../content/index.js';
import createPreferences from '../../preferences/index.js';
import type { AstroSettings } from '../../types/astro.js';
import type { AstroConfig } from '../../types/public/config.js';
import { markdownContentEntryType } from '../../vite-plugin-markdown/content-entry-type.js';
import { getDefaultClientDirectives } from '../client-directive/index.js';
import { AstroError, AstroErrorData } from '../errors/index.js';
import { formatYAMLException, isYAMLException } from '../errors/utils.js';
import { SUPPORTED_MARKDOWN_FILE_EXTENSIONS } from './../constants.js';
import { AstroTimer } from './timer.js';
import { loadTSConfig } from './tsconfig.js';

export function createBaseSettings(config: AstroConfig): AstroSettings {
	const { contentDir } = getContentPaths(config);
	const dotAstroDir = new URL('.astro/', config.root);
	const preferences = createPreferences(config, dotAstroDir);
	return {
		config,
		preferences,
		tsConfig: undefined,
		tsConfigPath: undefined,
		adapter: undefined,
		injectedRoutes: [],
		resolvedInjectedRoutes: [],
		serverIslandMap: new Map(),
		serverIslandNameMap: new Map(),
		pageExtensions: ['.astro', '.html', ...SUPPORTED_MARKDOWN_FILE_EXTENSIONS],
		contentEntryTypes: [markdownContentEntryType],
		dataEntryTypes: [
			{
				extensions: ['.json'],
				getEntryInfo({ contents, fileUrl }) {
					if (contents === undefined || contents === '') return { data: {} };

					const pathRelToContentDir = path.relative(
						fileURLToPath(contentDir),
						fileURLToPath(fileUrl),
					);
					let data;
					try {
						data = JSON.parse(contents);
					} catch (e) {
						throw new AstroError({
							...AstroErrorData.DataCollectionEntryParseError,
							message: AstroErrorData.DataCollectionEntryParseError.message(
								pathRelToContentDir,
								e instanceof Error ? e.message : 'contains invalid JSON.',
							),
							location: { file: fileUrl.pathname },
							stack: e instanceof Error ? e.stack : undefined,
						});
					}

					if (data == null || typeof data !== 'object') {
						throw new AstroError({
							...AstroErrorData.DataCollectionEntryParseError,
							message: AstroErrorData.DataCollectionEntryParseError.message(
								pathRelToContentDir,
								'data is not an object.',
							),
							location: { file: fileUrl.pathname },
						});
					}

					return { data };
				},
			},
			{
				extensions: ['.yaml', '.yml'],
				getEntryInfo({ contents, fileUrl }) {
					try {
						const data = yaml.load(contents, { filename: fileURLToPath(fileUrl) });
						const rawData = contents;

						return { data, rawData };
					} catch (e) {
						const pathRelToContentDir = path.relative(
							fileURLToPath(contentDir),
							fileURLToPath(fileUrl),
						);
						const formattedError = isYAMLException(e)
							? formatYAMLException(e)
							: new Error('contains invalid YAML.');

						throw new AstroError({
							...AstroErrorData.DataCollectionEntryParseError,
							message: AstroErrorData.DataCollectionEntryParseError.message(
								pathRelToContentDir,
								formattedError.message,
							),
							stack: formattedError.stack,
							location:
								'loc' in formattedError
									? { file: fileUrl.pathname, ...formattedError.loc }
									: { file: fileUrl.pathname },
						});
					}
				},
			},
		],
		renderers: [],
		scripts: [],
		clientDirectives: getDefaultClientDirectives(),
		middlewares: { pre: [], post: [] },
		watchFiles: [],
		devToolbarApps: [],
		timer: new AstroTimer(),
		dotAstroDir,
		latestAstroVersion: undefined, // Will be set later if applicable when the dev server starts
		injectedTypes: [],
		buildOutput: undefined,
	};
}

export async function createSettings(config: AstroConfig, cwd?: string): Promise<AstroSettings> {
	const tsconfig = await loadTSConfig(cwd);
	const settings = createBaseSettings(config);

	let watchFiles = [];
	if (cwd) {
		watchFiles.push(fileURLToPath(new URL('./package.json', pathToFileURL(cwd))));
	}

	if (typeof tsconfig !== 'string') {
		watchFiles.push(
			...[tsconfig.tsconfigFile, ...(tsconfig.extended ?? []).map((e) => e.tsconfigFile)],
		);
		settings.tsConfig = tsconfig.tsconfig;
		settings.tsConfigPath = tsconfig.tsconfigFile;
	}

	settings.watchFiles = watchFiles;

	return settings;
}

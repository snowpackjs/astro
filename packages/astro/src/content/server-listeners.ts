import type fsMod from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { bold, cyan, underline } from 'kleur/colors';
import type { ViteDevServer } from 'vite';
import { loadTSConfig } from '../core/config/tsconfig.js';
import type { Logger } from '../core/logger/core.js';
import { appendForwardSlash } from '../core/path.js';
import type { AstroSettings } from '../types/astro.js';
import { createContentTypesGenerator } from './types-generator.js';
import { type ContentPaths, getContentPaths, globalContentConfigObserver } from './utils.js';

interface ContentServerListenerParams {
	fs: typeof fsMod;
	logger: Logger;
	settings: AstroSettings;
	viteServer: ViteDevServer;
}

export async function attachContentServerListeners({
	viteServer,
	fs,
	logger,
	settings,
}: ContentServerListenerParams) {
	const contentPaths = getContentPaths(settings.config, fs);
	if (!settings.config.legacy?.collections) {
		await attachListeners();
	} else if (fs.existsSync(contentPaths.contentDir)) {
		logger.debug(
			'content',
			`Watching ${cyan(
				contentPaths.contentDir.href.replace(settings.config.root.href, ''),
			)} for changes`,
		);
		const maybeTsConfigStats = await getTSConfigStatsWhenAllowJsFalse({ contentPaths, settings });
		if (maybeTsConfigStats) warnAllowJsIsFalse({ ...maybeTsConfigStats, logger });
		await attachListeners();
	} else {
		viteServer.watcher.on('addDir', contentDirListener);
		async function contentDirListener(dir: string) {
			if (appendForwardSlash(pathToFileURL(dir).href) === contentPaths.contentDir.href) {
				logger.debug('content', `Content directory found. Watching for changes`);
				await attachListeners();
				viteServer.watcher.removeListener('addDir', contentDirListener);
			}
		}
	}

	async function attachListeners() {
		const contentGenerator = await createContentTypesGenerator({
			fs,
			settings,
			logger,
			viteServer,
			contentConfigObserver: globalContentConfigObserver,
		});
		await contentGenerator.init();
		logger.debug('content', 'Types generated');

		viteServer.watcher.on('add', (entry) => {
			contentGenerator.queueEvent({ name: 'add', entry });
		});
		viteServer.watcher.on('addDir', (entry) =>
			contentGenerator.queueEvent({ name: 'addDir', entry }),
		);
		viteServer.watcher.on('change', (entry) => {
			contentGenerator.queueEvent({ name: 'change', entry });
		});
		viteServer.watcher.on('unlink', (entry) => {
			contentGenerator.queueEvent({ name: 'unlink', entry });
		});
		viteServer.watcher.on('unlinkDir', (entry) =>
			contentGenerator.queueEvent({ name: 'unlinkDir', entry }),
		);
	}
}

function warnAllowJsIsFalse({
	logger,
	tsConfigFileName,
	contentConfigFileName,
}: {
	logger: Logger;
	tsConfigFileName: string;
	contentConfigFileName: string;
}) {
	logger.warn(
		'content',
		`Make sure you have the ${bold('allowJs')} compiler option set to ${bold(
			'true',
		)} in your ${bold(tsConfigFileName)} file to have autocompletion in your ${bold(
			contentConfigFileName,
		)} file. See ${underline(
			cyan('https://www.typescriptlang.org/tsconfig#allowJs'),
		)} for more information.`,
	);
}

async function getTSConfigStatsWhenAllowJsFalse({
	contentPaths,
	settings,
}: {
	contentPaths: ContentPaths;
	settings: AstroSettings;
}) {
	const isContentConfigJsFile = ['.js', '.mjs'].some((ext) =>
		contentPaths.config.url.pathname.endsWith(ext),
	);
	if (!isContentConfigJsFile) return;

	const inputConfig = await loadTSConfig(fileURLToPath(settings.config.root));
	if (typeof inputConfig === 'string') return;

	const tsConfigFileName = inputConfig.tsconfigFile.split(path.sep).pop();
	if (!tsConfigFileName) return;

	const contentConfigFileName = contentPaths.config.url.pathname.split(path.sep).pop()!;
	const allowJSOption = inputConfig.tsconfig.compilerOptions?.allowJs;
	if (allowJSOption) return;

	return { tsConfigFileName, contentConfigFileName };
}

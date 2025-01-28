import fsMod from 'node:fs';
import { dirname, relative } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { dim } from 'kleur/colors';
import { type FSWatcher, type HMRPayload, createServer } from 'vite';
import { CONTENT_TYPES_FILE } from '../../content/consts.js';
import { getDataStoreFile, globalContentLayer } from '../../content/content-layer.js';
import { createContentTypesGenerator } from '../../content/index.js';
import { MutableDataStore } from '../../content/mutable-data-store.js';
import { getContentPaths, globalContentConfigObserver } from '../../content/utils.js';
import { syncAstroEnv } from '../../env/sync.js';
import { telemetry } from '../../events/index.js';
import { eventCliSession } from '../../events/session.js';
import { runHookConfigDone, runHookConfigSetup } from '../../integrations/hooks.js';
import type { AstroSettings, RoutesList } from '../../types/astro.js';
import type { AstroInlineConfig } from '../../types/public/config.js';
import { createDevelopmentManifest } from '../../vite-plugin-astro-server/plugin.js';
import type { SSRManifest } from '../app/types.js';
import { getTimeStat } from '../build/util.js';
import { resolveConfig } from '../config/config.js';
import { createNodeLogger } from '../config/logging.js';
import { createSettings } from '../config/settings.js';
import { createVite } from '../create-vite.js';
import {
	AstroError,
	AstroErrorData,
	AstroUserError,
	type ErrorWithMetadata,
	createSafeError,
	isAstroError,
} from '../errors/index.js';
import type { Logger } from '../logger/core.js';
import { createRoutesList } from '../routing/index.js';
import { ensureProcessNodeEnv } from '../util.js';
import { normalizePath } from '../viteUtils.js';

export type SyncOptions = {
	mode: string;
	/**
	 * @internal only used for testing
	 */
	fs?: typeof fsMod;
	logger: Logger;
	settings: AstroSettings;
	force?: boolean;
	skip?: {
		// Must be skipped in dev
		content?: boolean;
		// Cleanup can be skipped in dev as some state can be reused on updates
		cleanup?: boolean;
	};
	routesList: RoutesList;
	manifest: SSRManifest;
	command: 'build' | 'dev' | 'sync';
	watcher?: FSWatcher;
};

export default async function sync(
	inlineConfig: AstroInlineConfig,
	{ fs, telemetry: _telemetry = false }: { fs?: typeof fsMod; telemetry?: boolean } = {},
) {
	ensureProcessNodeEnv('production');
	const logger = createNodeLogger(inlineConfig);
	const { astroConfig, userConfig } = await resolveConfig(inlineConfig ?? {}, 'sync');
	if (_telemetry) {
		telemetry.record(eventCliSession('sync', userConfig));
	}
	let settings = await createSettings(astroConfig, inlineConfig.root);
	settings = await runHookConfigSetup({
		command: 'sync',
		settings,
		logger,
	});
	const routesList = await createRoutesList({ settings, fsMod: fs }, logger);
	const manifest = createDevelopmentManifest(settings);
	await runHookConfigDone({ settings, logger });

	return await syncInternal({
		settings,
		logger,
		mode: 'production',
		fs,
		force: inlineConfig.force,
		routesList,
		command: 'sync',
		manifest,
	});
}

/**
 * Clears the content layer and content collection cache, forcing a full rebuild.
 */
export async function clearContentLayerCache({
	settings,
	logger,
	fs = fsMod,
	isDev,
}: {
	settings: AstroSettings;
	logger: Logger;
	fs?: typeof fsMod;
	isDev: boolean;
}) {
	const dataStore = getDataStoreFile(settings, isDev);
	if (fs.existsSync(dataStore)) {
		logger.debug('content', 'clearing data store');
		await fs.promises.rm(dataStore, { force: true });
		logger.warn('content', 'data store cleared (force)');
	}
}

/**
 * Generates TypeScript types for all Astro modules. This sets up a `src/env.d.ts` file for type inferencing,
 * and defines the `astro:content` module for the Content Collections API.
 *
 * @experimental The JavaScript API is experimental
 */
export async function syncInternal({
	mode,
	logger,
	fs = fsMod,
	settings,
	skip,
	force,
	routesList,
	command,
	watcher,
	manifest,
}: SyncOptions): Promise<void> {
	const isDev = command === 'dev';
	if (force) {
		await clearContentLayerCache({ settings, logger, fs, isDev });
	}

	const timerStart = performance.now();

	if (!skip?.content) {
		await syncContentCollections(settings, { mode, fs, logger, routesList, manifest });
		settings.timer.start('Sync content layer');

		let store: MutableDataStore | undefined;
		try {
			const dataStoreFile = getDataStoreFile(settings, isDev);
			store = await MutableDataStore.fromFile(dataStoreFile);
		} catch (err: any) {
			logger.error('content', err.message);
		}
		if (!store) {
			logger.error('content', 'Failed to load content store');
			return;
		}

		const contentLayer = globalContentLayer.init({
			settings,
			logger,
			store,
			watcher,
		});
		if (watcher) {
			contentLayer.watchContentConfig();
		}
		await contentLayer.sync();
		if (!skip?.cleanup) {
			// Free up memory (usually in builds since we only need to use this once)
			contentLayer.dispose();
		}
		settings.timer.end('Sync content layer');
	} else {
		const paths = getContentPaths(settings.config, fs);
		if (
			paths.config.exists ||
			// Legacy collections don't require a config file
			(settings.config.legacy?.collections && fs.existsSync(paths.contentDir))
		) {
			// We only create the reference, without a stub to avoid overriding the
			// already generated types
			settings.injectedTypes.push({
				filename: CONTENT_TYPES_FILE,
			});
		}
	}
	syncAstroEnv(settings);

	writeInjectedTypes(settings, fs);
	logger.info('types', `Generated ${dim(getTimeStat(timerStart, performance.now()))}`);
}

function getTsReference(type: 'path' | 'types', value: string) {
	return `/// <reference ${type}=${JSON.stringify(value)} />`;
}

const CLIENT_TYPES_REFERENCE = getTsReference('types', 'astro/client');

function writeInjectedTypes(settings: AstroSettings, fs: typeof fsMod) {
	const references: Array<string> = [];

	for (const { filename, content } of settings.injectedTypes) {
		const filepath = fileURLToPath(new URL(filename, settings.dotAstroDir));
		fs.mkdirSync(dirname(filepath), { recursive: true });
		if (content) {
			fs.writeFileSync(filepath, content, 'utf-8');
		}
		references.push(normalizePath(relative(fileURLToPath(settings.dotAstroDir), filepath)));
	}

	const astroDtsContent = `${CLIENT_TYPES_REFERENCE}\n${references.map((reference) => getTsReference('path', reference)).join('\n')}`;
	if (references.length === 0) {
		fs.mkdirSync(settings.dotAstroDir, { recursive: true });
	}
	fs.writeFileSync(
		fileURLToPath(new URL('./types.d.ts', settings.dotAstroDir)),
		astroDtsContent,
		'utf-8',
	);
}

/**
 * Generate content collection types, and then returns the process exit signal.
 *
 * A non-zero process signal is emitted in case there's an error while generating content collection types.
 *
 * This should only be used when the callee already has an `AstroSetting`, otherwise use `sync()` instead.
 * @internal
 *
 * @param {SyncOptions} options
 * @param {AstroSettings} settings Astro settings
 * @param {typeof fsMod} options.fs The file system
 * @param {LogOptions} options.logging Logging options
 * @return {Promise<ProcessExit>}
 */
async function syncContentCollections(
	settings: AstroSettings,
	{
		mode,
		logger,
		fs,
		routesList,
		manifest,
	}: Required<Pick<SyncOptions, 'mode' | 'logger' | 'fs' | 'routesList' | 'manifest'>>,
): Promise<void> {
	// Needed to load content config
	const tempViteServer = await createServer(
		await createVite(
			{
				server: { middlewareMode: true, hmr: false, watch: null, ws: false },
				optimizeDeps: { noDiscovery: true },
				ssr: { external: [] },
				logLevel: 'silent',
			},
			{ settings, logger, mode, command: 'build', fs, sync: true, routesList, manifest },
		),
	);

	// Patch `hot.send` to bubble up error events
	// `hot.on('error')` does not fire for some reason
	const hotSend = tempViteServer.hot.send;
	tempViteServer.hot.send = (payload: HMRPayload) => {
		if (payload.type === 'error') {
			throw payload.err;
		}
		return hotSend(payload);
	};

	try {
		const contentTypesGenerator = await createContentTypesGenerator({
			contentConfigObserver: globalContentConfigObserver,
			logger: logger,
			fs,
			settings,
			viteServer: tempViteServer,
		});
		const typesResult = await contentTypesGenerator.init();

		const contentConfig = globalContentConfigObserver.get();
		if (contentConfig.status === 'error') {
			throw contentConfig.error;
		}

		if (typesResult.typesGenerated === false) {
			switch (typesResult.reason) {
				case 'no-content-dir':
				default:
					logger.debug('types', 'No content directory found. Skipping type generation.');
			}
		}
	} catch (e) {
		const safeError = createSafeError(e) as ErrorWithMetadata;
		if (isAstroError(e)) {
			throw e;
		}
		let configFile;
		try {
			const contentPaths = getContentPaths(settings.config, fs);
			if (contentPaths.config.exists) {
				const matches = /\/(src\/.+)/.exec(contentPaths.config.url.href);
				if (matches) {
					configFile = matches[1];
				}
			}
		} catch {
			// ignore
		}

		const hint = AstroUserError.is(e)
			? e.hint
			: AstroErrorData.GenerateContentTypesError.hint(configFile);
		throw new AstroError(
			{
				...AstroErrorData.GenerateContentTypesError,
				hint,
				message: AstroErrorData.GenerateContentTypesError.message(safeError.message),
				location: safeError.loc,
			},
			{ cause: e },
		);
	} finally {
		await tempViteServer.close();
	}
}

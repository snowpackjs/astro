import { promises as fs, existsSync } from 'node:fs';
import PQueue from 'p-queue';
import type { FSWatcher } from 'vite';
import xxhash from 'xxhash-wasm';
import type { z } from 'zod';
import { AstroError, AstroErrorData } from '../core/errors/index.js';
import type { Logger } from '../core/logger/core.js';
import type { AstroSettings } from '../types/astro.js';
import type { ContentEntryType, RefreshContentOptions } from '../types/public/content.js';
import {
	ASSET_IMPORTS_FILE,
	COLLECTIONS_MANIFEST_FILE,
	CONTENT_LAYER_TYPE,
	DATA_STORE_FILE,
	MODULES_IMPORTS_FILE,
} from './consts.js';
import type { LoaderContext } from './loaders/types.js';
import type { MutableDataStore } from './mutable-data-store.js';
import {
	type ContentObservable,
	getEntryConfigByExtMap,
	getEntryDataAndImages,
	globalContentConfigObserver,
	loaderReturnSchema,
	safeStringify,
} from './utils.js';
import { type WrappedWatcher, createWatcherWrapper } from './watcher.js';

export interface ContentLayerOptions {
	store: MutableDataStore;
	settings: AstroSettings;
	logger: Logger;
	watcher?: FSWatcher;
}

type CollectionLoader<TData> = () =>
	| Array<TData>
	| Promise<Array<TData>>
	| Record<string, Record<string, unknown>>
	| Promise<Record<string, Record<string, unknown>>>;

export class ContentLayer {
	#logger: Logger;
	#store: MutableDataStore;
	#settings: AstroSettings;
	#watcher?: WrappedWatcher;
	#lastConfigDigest?: string;
	#unsubscribe?: () => void;

	#generateDigest?: (data: Record<string, unknown> | string) => string;

	#queue: PQueue;

	constructor({ settings, logger, store, watcher }: ContentLayerOptions) {
		// The default max listeners is 10, which can be exceeded when using a lot of loaders
		watcher?.setMaxListeners(50);

		this.#logger = logger;
		this.#store = store;
		this.#settings = settings;
		if (watcher) {
			this.#watcher = createWatcherWrapper(watcher);
		}
		this.#queue = new PQueue({ concurrency: 1 });
	}

	/**
	 * Whether the content layer is currently loading content
	 */
	get loading() {
		return this.#queue.size > 0 || this.#queue.pending > 0;
	}

	/**
	 * Watch for changes to the content config and trigger a sync when it changes.
	 */
	watchContentConfig() {
		this.#unsubscribe?.();
		this.#unsubscribe = globalContentConfigObserver.subscribe(async (ctx) => {
			if (ctx.status === 'loaded' && ctx.config.digest !== this.#lastConfigDigest) {
				this.sync();
			}
		});
	}

	unwatchContentConfig() {
		this.#unsubscribe?.();
	}

	dispose() {
		this.#queue.clear();
		this.#unsubscribe?.();
		this.#watcher?.removeAllTrackedListeners();
	}

	async #getGenerateDigest() {
		if (this.#generateDigest) {
			return this.#generateDigest;
		}
		// xxhash is a very fast non-cryptographic hash function that is used to generate a content digest
		// It uses wasm, so we need to load it asynchronously.
		const { h64ToString } = await xxhash();

		this.#generateDigest = (data: unknown) => {
			const dataString = typeof data === 'string' ? data : JSON.stringify(data);
			return h64ToString(dataString);
		};

		return this.#generateDigest;
	}

	async #getLoaderContext({
		collectionName,
		loaderName = 'content',
		parseData,
		refreshContextData,
	}: {
		collectionName: string;
		loaderName: string;
		parseData: LoaderContext['parseData'];
		refreshContextData?: Record<string, unknown>;
	}): Promise<LoaderContext> {
		return {
			collection: collectionName,
			store: this.#store.scopedStore(collectionName),
			meta: this.#store.metaStore(collectionName),
			logger: this.#logger.forkIntegrationLogger(loaderName),
			config: this.#settings.config,
			parseData,
			generateDigest: await this.#getGenerateDigest(),
			watcher: this.#watcher,
			refreshContextData,
			entryTypes: getEntryConfigByExtMap([
				...this.#settings.contentEntryTypes,
				...this.#settings.dataEntryTypes,
			] as Array<ContentEntryType>),
		};
	}

	/**
	 * Enqueues a sync job that runs the `load()` method of each collection's loader, which will load the data and save it in the data store.
	 * The loader itself is responsible for deciding whether this will clear and reload the full collection, or
	 * perform an incremental update. After the data is loaded, the data store is written to disk. Jobs are queued,
	 * so that only one sync can run at a time. The function returns a promise that resolves when this sync job is complete.
	 */

	sync(options: RefreshContentOptions = {}): Promise<void> {
		return this.#queue.add(() => this.#doSync(options));
	}

	async #doSync(options: RefreshContentOptions) {
		let contentConfig = globalContentConfigObserver.get();
		const logger = this.#logger.forkIntegrationLogger('content');

		if (contentConfig?.status === 'loading') {
			contentConfig = await Promise.race<ReturnType<ContentObservable['get']>>([
				new Promise((resolve) => {
					const unsub = globalContentConfigObserver.subscribe((ctx) => {
						unsub();
						resolve(ctx);
					});
				}),
				new Promise((resolve) =>
					setTimeout(
						() =>
							resolve({ status: 'error', error: new Error('Content config loading timed out') }),
						5000,
					),
				),
			]);
		}

		if (contentConfig?.status === 'error') {
			logger.error(`Error loading content config. Skipping sync.\n${contentConfig.error.message}`);
			return;
		}

		// It shows as loaded with no collections even if there's no config
		if (contentConfig?.status !== 'loaded') {
			logger.error(`Content config not loaded, skipping sync. Status was ${contentConfig?.status}`);
			return;
		}

		logger.info('Syncing content');
		const {
			vite: _vite,
			integrations: _integrations,
			adapter: _adapter,
			...hashableConfig
		} = this.#settings.config;

		const astroConfigDigest = safeStringify(hashableConfig);

		const { digest: currentConfigDigest } = contentConfig.config;
		this.#lastConfigDigest = currentConfigDigest;

		let shouldClear = false;
		const previousConfigDigest = await this.#store.metaStore().get('content-config-digest');
		const previousAstroConfigDigest = await this.#store.metaStore().get('astro-config-digest');
		const previousAstroVersion = await this.#store.metaStore().get('astro-version');

		if (previousAstroConfigDigest && previousAstroConfigDigest !== astroConfigDigest) {
			logger.info('Astro config changed');
			shouldClear = true;
		}

		if (previousConfigDigest && previousConfigDigest !== currentConfigDigest) {
			logger.info('Content config changed');
			shouldClear = true;
		}
		if (previousAstroVersion && previousAstroVersion !== process.env.ASTRO_VERSION) {
			logger.info('Astro version changed');
			shouldClear = true;
		}
		if (shouldClear) {
			logger.info('Clearing content store');
			this.#store.clearAll();
		}
		if (process.env.ASTRO_VERSION) {
			await this.#store.metaStore().set('astro-version', process.env.ASTRO_VERSION);
		}
		if (currentConfigDigest) {
			await this.#store.metaStore().set('content-config-digest', currentConfigDigest);
		}
		if (astroConfigDigest) {
			await this.#store.metaStore().set('astro-config-digest', astroConfigDigest);
		}

		if (!options?.loaders?.length) {
			// Remove all listeners before syncing, as they will be re-added by the loaders, but not if this is a selective sync
			this.#watcher?.removeAllTrackedListeners();
		}

		await Promise.all(
			Object.entries(contentConfig.config.collections).map(async ([name, collection]) => {
				if (collection.type !== CONTENT_LAYER_TYPE) {
					return;
				}

				let { schema } = collection;

				if (!schema && typeof collection.loader === 'object') {
					schema = collection.loader.schema;
					if (typeof schema === 'function') {
						schema = await schema();
					}
				}

				// If loaders are specified, only sync the specified loaders
				if (
					options?.loaders &&
					(typeof collection.loader !== 'object' ||
						!options.loaders.includes(collection.loader.name))
				) {
					return;
				}

				const collectionWithResolvedSchema = { ...collection, schema };

				const parseData: LoaderContext['parseData'] = async ({ id, data, filePath = '' }) => {
					const { data: parsedData } = await getEntryDataAndImages(
						{
							id,
							collection: name,
							unvalidatedData: data,
							_internal: {
								rawData: undefined,
								filePath,
							},
						},
						collectionWithResolvedSchema,
						false,
						!!this.#settings.config.experimental.svg,
					);

					return parsedData;
				};

				const context = await this.#getLoaderContext({
					collectionName: name,
					parseData,
					loaderName: collection.loader.name,
					refreshContextData: options?.context,
				});

				if (typeof collection.loader === 'function') {
					return simpleLoader(collection.loader as CollectionLoader<{ id: string }>, context);
				}

				if (!collection.loader.load) {
					throw new Error(`Collection loader for ${name} does not have a load method`);
				}

				return collection.loader.load(context);
			}),
		);
		await fs.mkdir(this.#settings.config.cacheDir, { recursive: true });
		await fs.mkdir(this.#settings.dotAstroDir, { recursive: true });
		await this.#store.writeToDisk();
		const assetImportsFile = new URL(ASSET_IMPORTS_FILE, this.#settings.dotAstroDir);
		await this.#store.writeAssetImports(assetImportsFile);
		const modulesImportsFile = new URL(MODULES_IMPORTS_FILE, this.#settings.dotAstroDir);
		await this.#store.writeModuleImports(modulesImportsFile);
		logger.info('Synced content');
		if (this.#settings.config.experimental.contentIntellisense) {
			await this.regenerateCollectionFileManifest();
		}
	}

	async regenerateCollectionFileManifest() {
		const collectionsManifest = new URL(COLLECTIONS_MANIFEST_FILE, this.#settings.dotAstroDir);
		this.#logger.debug('content', 'Regenerating collection file manifest');
		if (existsSync(collectionsManifest)) {
			try {
				const collections = await fs.readFile(collectionsManifest, 'utf-8');
				const collectionsJson = JSON.parse(collections);
				collectionsJson.entries ??= {};

				for (const { hasSchema, name } of collectionsJson.collections) {
					if (!hasSchema) {
						continue;
					}
					const entries = this.#store.values(name);
					if (!entries?.[0]?.filePath) {
						continue;
					}
					for (const { filePath } of entries) {
						if (!filePath) {
							continue;
						}
						const key = new URL(filePath, this.#settings.config.root).href.toLowerCase();
						collectionsJson.entries[key] = name;
					}
				}
				await fs.writeFile(collectionsManifest, JSON.stringify(collectionsJson, null, 2));
			} catch {
				this.#logger.error('content', 'Failed to regenerate collection file manifest');
			}
		}
		this.#logger.debug('content', 'Regenerated collection file manifest');
	}
}

export async function simpleLoader<TData extends { id: string }>(
	handler: CollectionLoader<TData>,
	context: LoaderContext,
) {
	const unsafeData = await handler();
	const parsedData = loaderReturnSchema.safeParse(unsafeData);

	if (!parsedData.success) {
		const issue = parsedData.error.issues[0] as z.ZodInvalidUnionIssue;

		// Due to this being a union, zod will always throw an "Expected array, received object" error along with the other errors.
		// This error is in the second position if the data is an array, and in the first position if the data is an object.
		const parseIssue = Array.isArray(unsafeData) ? issue.unionErrors[0] : issue.unionErrors[1];

		const error = parseIssue.errors[0];
		const firstPathItem = error.path[0];

		const entry = Array.isArray(unsafeData)
			? unsafeData[firstPathItem as number]
			: unsafeData[firstPathItem as string];

		throw new AstroError({
			...AstroErrorData.ContentLoaderReturnsInvalidId,
			message: AstroErrorData.ContentLoaderReturnsInvalidId.message(context.collection, entry),
		});
	}

	const data = parsedData.data;

	context.store.clear();

	if (Array.isArray(data)) {
		for (const raw of data) {
			if (!raw.id) {
				throw new AstroError({
					...AstroErrorData.ContentLoaderInvalidDataError,
					message: AstroErrorData.ContentLoaderInvalidDataError.message(
						context.collection,
						`Entry missing ID:\n${JSON.stringify({ ...raw, id: undefined }, null, 2)}`,
					),
				});
			}
			const item = await context.parseData({ id: raw.id, data: raw });
			context.store.set({ id: raw.id, data: item });
		}
		return;
	}
	if (typeof data === 'object') {
		for (const [id, raw] of Object.entries(data)) {
			if (raw.id && raw.id !== id) {
				throw new AstroError({
					...AstroErrorData.ContentLoaderInvalidDataError,
					message: AstroErrorData.ContentLoaderInvalidDataError.message(
						context.collection,
						`Object key ${JSON.stringify(id)} does not match ID ${JSON.stringify(raw.id)}`,
					),
				});
			}
			const item = await context.parseData({ id, data: raw });
			context.store.set({ id, data: item });
		}
		return;
	}
	throw new AstroError({
		...AstroErrorData.ExpectedImageOptions,
		message: AstroErrorData.ContentLoaderInvalidDataError.message(
			context.collection,
			`Invalid data type: ${typeof data}`,
		),
	});
}
/**
 * Get the path to the data store file.
 * During development, this is in the `.astro` directory so that the Vite watcher can see it.
 * In production, it's in the cache directory so that it's preserved between builds.
 */
export function getDataStoreFile(settings: AstroSettings, isDev: boolean) {
	return new URL(DATA_STORE_FILE, isDev ? settings.dotAstroDir : settings.config.cacheDir);
}

function contentLayerSingleton() {
	let instance: ContentLayer | null = null;
	return {
		init: (options: ContentLayerOptions) => {
			instance?.dispose();
			instance = new ContentLayer(options);
			return instance;
		},
		get: () => instance,
		dispose: () => {
			instance?.dispose();
			instance = null;
		},
	};
}

export const globalContentLayer = contentLayerSingleton();

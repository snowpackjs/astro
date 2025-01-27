import { promises as fs, type PathLike, existsSync } from 'node:fs';
import * as devalue from 'devalue';
import { Traverse } from 'neotraverse/modern';
import { imageSrcToImportId, importIdToSymbolName } from '../assets/utils/resolveImports.js';
import { AstroError, AstroErrorData } from '../core/errors/index.js';
import { IMAGE_IMPORT_PREFIX } from './consts.js';
import { type DataEntry, ImmutableDataStore } from './data-store.js';
import { contentModuleToId } from './utils.js';

const SAVE_DEBOUNCE_MS = 500;

const MAX_DEPTH = 10;

/**
 * Extends the DataStore with the ability to change entries and write them to disk.
 * This is kept as a separate class to avoid needing node builtins at runtime, when read-only access is all that is needed.
 */
export class MutableDataStore extends ImmutableDataStore {
	#file?: PathLike;

	#assetsFile?: PathLike;
	#modulesFile?: PathLike;

	#saveTimeout: NodeJS.Timeout | undefined;
	#assetsSaveTimeout: NodeJS.Timeout | undefined;
	#modulesSaveTimeout: NodeJS.Timeout | undefined;

	#dirty = false;
	#assetsDirty = false;
	#modulesDirty = false;

	#assetImports = new Set<string>();
	#moduleImports = new Map<string, string>();

	set(collectionName: string, key: string, value: unknown) {
		const collection = this._collections.get(collectionName) ?? new Map();
		collection.set(String(key), value);
		this._collections.set(collectionName, collection);
		this.#saveToDiskDebounced();
	}

	delete(collectionName: string, key: string) {
		const collection = this._collections.get(collectionName);
		if (collection) {
			collection.delete(String(key));
			this.#saveToDiskDebounced();
		}
	}

	clear(collectionName: string) {
		this._collections.delete(collectionName);
		this.#saveToDiskDebounced();
	}

	clearAll() {
		this._collections.clear();
		this.#saveToDiskDebounced();
	}

	addAssetImport(assetImport: string, filePath?: string) {
		const id = imageSrcToImportId(assetImport, filePath);
		if (id) {
			this.#assetImports.add(id);
			// We debounce the writes to disk because addAssetImport is called for every image in every file,
			// and can be called many times in quick succession by a filesystem watcher. We only want to write
			// the file once, after all the imports have been added.
			this.#writeAssetsImportsDebounced();
		}
	}

	addAssetImports(assets: Array<string>, filePath?: string) {
		assets.forEach((asset) => this.addAssetImport(asset, filePath));
	}

	addModuleImport(fileName: string) {
		const id = contentModuleToId(fileName);
		if (id) {
			this.#moduleImports.set(fileName, id);
			// We debounce the writes to disk because addAssetImport is called for every image in every file,
			// and can be called many times in quick succession by a filesystem watcher. We only want to write
			// the file once, after all the imports have been added.
			this.#writeModulesImportsDebounced();
		}
	}

	async writeAssetImports(filePath: PathLike) {
		this.#assetsFile = filePath;

		if (this.#assetImports.size === 0) {
			try {
				await this.#writeFileAtomic(filePath, 'export default new Map();');
			} catch (err) {
				throw new AstroError(AstroErrorData.UnknownFilesystemError, { cause: err });
			}
		}

		if (!this.#assetsDirty && existsSync(filePath)) {
			return;
		}
		// Import the assets, with a symbol name that is unique to the import id. The import
		// for each asset is an object with path, format and dimensions.
		// We then export them all, mapped by the import id, so we can find them again in the build.
		const imports: Array<string> = [];
		const exports: Array<string> = [];
		this.#assetImports.forEach((id) => {
			const symbol = importIdToSymbolName(id);
			imports.push(`import ${symbol} from ${JSON.stringify(id)};`);
			exports.push(`[${JSON.stringify(id)}, ${symbol}]`);
		});
		const code = /* js */ `
${imports.join('\n')}
export default new Map([${exports.join(', ')}]);
		`;
		try {
			await this.#writeFileAtomic(filePath, code);
		} catch (err) {
			throw new AstroError(AstroErrorData.UnknownFilesystemError, { cause: err });
		}
		this.#assetsDirty = false;
	}

	async writeModuleImports(filePath: PathLike) {
		this.#modulesFile = filePath;

		if (this.#moduleImports.size === 0) {
			try {
				await this.#writeFileAtomic(filePath, 'export default new Map();');
			} catch (err) {
				throw new AstroError(AstroErrorData.UnknownFilesystemError, { cause: err });
			}
		}

		if (!this.#modulesDirty && existsSync(filePath)) {
			return;
		}

		// Import the assets, with a symbol name that is unique to the import id. The import
		// for each asset is an object with path, format and dimensions.
		// We then export them all, mapped by the import id, so we can find them again in the build.
		const lines: Array<string> = [];
		for (const [fileName, specifier] of this.#moduleImports) {
			lines.push(`[${JSON.stringify(fileName)}, () => import(${JSON.stringify(specifier)})]`);
		}
		const code = `
export default new Map([\n${lines.join(',\n')}]);
		`;
		try {
			await this.#writeFileAtomic(filePath, code);
		} catch (err) {
			throw new AstroError(AstroErrorData.UnknownFilesystemError, { cause: err });
		}
		this.#modulesDirty = false;
	}

	#writeAssetsImportsDebounced() {
		this.#assetsDirty = true;
		if (this.#assetsFile) {
			if (this.#assetsSaveTimeout) {
				clearTimeout(this.#assetsSaveTimeout);
			}
			this.#assetsSaveTimeout = setTimeout(() => {
				this.#assetsSaveTimeout = undefined;
				this.writeAssetImports(this.#assetsFile!);
			}, SAVE_DEBOUNCE_MS);
		}
	}

	#writeModulesImportsDebounced() {
		this.#modulesDirty = true;
		if (this.#modulesFile) {
			if (this.#modulesSaveTimeout) {
				clearTimeout(this.#modulesSaveTimeout);
			}
			this.#modulesSaveTimeout = setTimeout(() => {
				this.#modulesSaveTimeout = undefined;
				this.writeModuleImports(this.#modulesFile!);
			}, SAVE_DEBOUNCE_MS);
		}
	}

	#saveToDiskDebounced() {
		this.#dirty = true;
		if (this.#saveTimeout) {
			clearTimeout(this.#saveTimeout);
		}
		this.#saveTimeout = setTimeout(() => {
			this.#saveTimeout = undefined;
			if (this.#file) {
				this.writeToDisk();
			}
		}, SAVE_DEBOUNCE_MS);
	}

	#writing = new Set<string>();
	#pending = new Set<string>();

	async #writeFileAtomic(filePath: PathLike, data: string, depth = 0) {
		if (depth > MAX_DEPTH) {
			// If we hit the max depth, we skip a write to prevent the stack from growing too large
			// In theory this means we may miss the latest data, but in practice this will only happen when the file is being written to very frequently
			// so it will be saved on the next write. This is unlikely to ever happen in practice, as the writes are debounced. It requires lots of writes to very large files.
			return;
		}
		const fileKey = filePath.toString();
		// If we are already writing this file, instead of writing now, flag it as pending and write it when we're done.
		if (this.#writing.has(fileKey)) {
			this.#pending.add(fileKey);
			return;
		}
		// Prevent concurrent writes to this file by flagging it as being written
		this.#writing.add(fileKey);

		const tempFile = filePath instanceof URL ? new URL(`${filePath.href}.tmp`) : `${filePath}.tmp`;
		try {
			const oldData = await fs.readFile(filePath, 'utf-8').catch(() => '');
			if (oldData === data) {
				// If the data hasn't changed, we can skip the write
				return;
			}
			// Write it to a temporary file first and then move it to prevent partial reads.
			await fs.writeFile(tempFile, data);
			await fs.rename(tempFile, filePath);
		} finally {
			// We're done writing. Unflag the file and check if there are any pending writes for this file.
			this.#writing.delete(fileKey);
			// If there are pending writes, we need to write again to ensure we flush the latest data.
			if (this.#pending.has(fileKey)) {
				this.#pending.delete(fileKey);
				// Call ourself recursively to write the file again
				await this.#writeFileAtomic(filePath, data, depth + 1);
			}
		}
	}

	scopedStore(collectionName: string): DataStore {
		return {
			get: <TData extends Record<string, unknown> = Record<string, unknown>>(key: string) =>
				this.get<DataEntry<TData>>(collectionName, key),
			entries: () => this.entries(collectionName),
			values: () => this.values(collectionName),
			keys: () => this.keys(collectionName),
			set: ({
				id: key,
				data,
				body,
				filePath,
				deferredRender,
				digest,
				rendered,
				assetImports,
				legacyId,
			}) => {
				if (!key) {
					throw new Error(`ID must be a non-empty string`);
				}
				const id = String(key);
				if (digest) {
					const existing = this.get<DataEntry>(collectionName, id);
					if (existing && existing.digest === digest) {
						return false;
					}
				}
				const foundAssets = new Set<string>(assetImports);
				// Check for image imports in the data. These will have been prefixed during schema parsing
				new Traverse(data).forEach((_, val) => {
					if (typeof val === 'string' && val.startsWith(IMAGE_IMPORT_PREFIX)) {
						const src = val.replace(IMAGE_IMPORT_PREFIX, '');
						foundAssets.add(src);
					}
				});

				const entry: DataEntry = {
					id,
					data,
				};
				// We do it like this so we don't waste space stringifying
				// the fields if they are not set
				if (body) {
					entry.body = body;
				}
				if (filePath) {
					if (filePath.startsWith('/')) {
						throw new Error(`File path must be relative to the site root. Got: ${filePath}`);
					}
					entry.filePath = filePath;
				}

				if (foundAssets.size) {
					entry.assetImports = Array.from(foundAssets);
					this.addAssetImports(entry.assetImports, filePath);
				}

				if (digest) {
					entry.digest = digest;
				}
				if (rendered) {
					entry.rendered = rendered;
				}
				if (legacyId) {
					entry.legacyId = legacyId;
				}
				if (deferredRender) {
					entry.deferredRender = deferredRender;
					if (filePath) {
						this.addModuleImport(filePath);
					}
				}
				this.set(collectionName, id, entry);
				return true;
			},
			delete: (key: string) => this.delete(collectionName, key),
			clear: () => this.clear(collectionName),
			has: (key: string) => this.has(collectionName, key),
			addAssetImport: (assetImport: string, fileName: string) =>
				this.addAssetImport(assetImport, fileName),
			addAssetImports: (assets: Array<string>, fileName: string) =>
				this.addAssetImports(assets, fileName),
			addModuleImport: (fileName: string) => this.addModuleImport(fileName),
		};
	}
	/**
	 * Returns a MetaStore for a given collection, or if no collection is provided, the default meta collection.
	 */
	metaStore(collectionName = ':meta'): MetaStore {
		const collectionKey = `meta:${collectionName}`;
		return {
			get: (key: string) => this.get(collectionKey, key),
			set: (key: string, data: string) => this.set(collectionKey, key, data),
			delete: (key: string) => this.delete(collectionKey, key),
			has: (key: string) => this.has(collectionKey, key),
		};
	}

	toString() {
		return devalue.stringify(this._collections);
	}

	async writeToDisk() {
		if (!this.#dirty) {
			return;
		}
		if (!this.#file) {
			throw new AstroError(AstroErrorData.UnknownFilesystemError);
		}
		try {
			await this.#writeFileAtomic(this.#file, this.toString());
			this.#dirty = false;
		} catch (err) {
			throw new AstroError(AstroErrorData.UnknownFilesystemError, { cause: err });
		}
	}

	/**
	 * Attempts to load a MutableDataStore from the virtual module.
	 * This only works in Vite.
	 */
	static async fromModule() {
		try {
			// @ts-expect-error - this is a virtual module
			const data = await import('astro:data-layer-content');
			const map = devalue.unflatten(data.default);
			return MutableDataStore.fromMap(map);
		} catch {}
		return new MutableDataStore();
	}

	static async fromMap(data: Map<string, Map<string, any>>) {
		const store = new MutableDataStore();
		store._collections = data;
		return store;
	}

	static async fromString(data: string) {
		const map = devalue.parse(data);
		return MutableDataStore.fromMap(map);
	}

	static async fromFile(filePath: string | URL) {
		try {
			if (existsSync(filePath)) {
				const data = await fs.readFile(filePath, 'utf-8');
				const store = await MutableDataStore.fromString(data);
				store.#file = filePath;
				return store;
			} else {
				await fs.mkdir(new URL('./', filePath), { recursive: true });
			}
		} catch {}
		const store = new MutableDataStore();
		store.#file = filePath;
		return store;
	}
}

// This is the scoped store for a single collection. It's a subset of the MutableDataStore API, and is the only public type.
export interface DataStore {
	get: <TData extends Record<string, unknown> = Record<string, unknown>>(
		key: string,
	) => DataEntry<TData> | undefined;
	entries: () => Array<[id: string, DataEntry]>;
	set: <TData extends Record<string, unknown>>(opts: DataEntry<TData>) => boolean;
	values: () => Array<DataEntry>;
	keys: () => Array<string>;
	delete: (key: string) => void;
	clear: () => void;
	has: (key: string) => boolean;
	/**
	 * @internal Adds asset imports to the store. This is used to track image imports for the build. This API is subject to change.
	 */
	addAssetImports: (assets: Array<string>, fileName: string) => void;
	/**
	 * @internal Adds an asset import to the store. This is used to track image imports for the build. This API is subject to change.
	 */
	addAssetImport: (assetImport: string, fileName: string) => void;
	/**
	 * Adds a single asset to the store. This asset will be transformed
	 * by Vite, and the URL will be available in the final build.
	 * @param fileName
	 * @param specifier
	 * @returns
	 */
	addModuleImport: (fileName: string) => void;
}

/**
 * A key-value store for metadata strings. Useful for storing things like sync tokens.
 */

export interface MetaStore {
	get: (key: string) => string | undefined;
	set: (key: string, value: string) => void;
	has: (key: string) => boolean;
	delete: (key: string) => void;
}

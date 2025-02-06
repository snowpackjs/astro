import type { MarkdownHeading } from '@astrojs/markdown-remark';
import * as devalue from 'devalue';

export interface RenderedContent {
	/** Rendered HTML string. If present then `render(entry)` will return a component that renders this HTML. */
	html: string;
	metadata?: {
		/** Any images that are present in this entry. Relative to the {@link DataEntry} filePath. */
		imagePaths?: Array<string>;
		/** Any headings that are present in this file. */
		headings?: MarkdownHeading[];
		/** Raw frontmatter, parsed parsed from the file. This may include data from remark plugins. */
		frontmatter?: Record<string, any>;
		/** Any other metadata that is present in this file. */
		[key: string]: unknown;
	};
}

export interface DataEntry<TData extends Record<string, unknown> = Record<string, unknown>> {
	/** The ID of the entry. Unique per collection. */
	id: string;
	/** The parsed entry data */
	data: TData;
	/** The file path of the content, if applicable. Relative to the site root. */
	filePath?: string;
	/** The raw body of the content, if applicable. */
	body?: string;
	/** An optional content digest, to check if the content has changed. */
	digest?: number | string;
	/** The rendered content of the entry, if applicable. */
	rendered?: RenderedContent;
	/**
	 * If an entry is a deferred, its rendering phase is delegated to a virtual module during the runtime phase when calling `renderEntry`.
	 */
	deferredRender?: boolean;
	assetImports?: Array<string>;
	/** @deprecated */
	legacyId?: string;
}

/**
 * A read-only data store for content collections. This is used to retrieve data from the content layer at runtime.
 * To add or modify data, use {@link MutableDataStore} instead.
 */

export class ImmutableDataStore {
	protected _collections = new Map<string, Map<string, any>>();

	constructor() {
		this._collections = new Map();
	}

	get<T = DataEntry>(collectionName: string, key: string): T | undefined {
		return this._collections.get(collectionName)?.get(String(key));
	}

	entries<T = DataEntry>(collectionName: string): Array<[id: string, T]> {
		const collection = this._collections.get(collectionName) ?? new Map();
		return [...collection.entries()];
	}

	values<T = DataEntry>(collectionName: string): Array<T> {
		const collection = this._collections.get(collectionName) ?? new Map();
		return [...collection.values()];
	}

	keys(collectionName: string): Array<string> {
		const collection = this._collections.get(collectionName) ?? new Map();
		return [...collection.keys()];
	}

	has(collectionName: string, key: string) {
		const collection = this._collections.get(collectionName);
		if (collection) {
			return collection.has(String(key));
		}
		return false;
	}

	hasCollection(collectionName: string) {
		return this._collections.has(collectionName);
	}

	collections() {
		return this._collections;
	}

	/**
	 * Attempts to load a DataStore from the virtual module.
	 * This only works in Vite.
	 */
	static async fromModule() {
		try {
			// @ts-expect-error - this is a virtual module
			const data = await import('astro:data-layer-content');
			if (data.default instanceof Map) {
				return ImmutableDataStore.fromMap(data.default);
			}
			const map = devalue.unflatten(data.default);
			return ImmutableDataStore.fromMap(map);
		} catch {}
		return new ImmutableDataStore();
	}

	static async fromMap(data: Map<string, Map<string, any>>) {
		const store = new ImmutableDataStore();
		store._collections = data;
		return store;
	}
}

function dataStoreSingleton() {
	let instance: Promise<ImmutableDataStore> | ImmutableDataStore | undefined = undefined;
	return {
		get: async () => {
			if (!instance) {
				instance = ImmutableDataStore.fromModule();
			}
			return instance;
		},
		set: (store: ImmutableDataStore) => {
			instance = store;
		},
	};
}

/** @internal */
export const globalDataStore = dataStoreSingleton();

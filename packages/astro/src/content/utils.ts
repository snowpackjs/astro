import fsMod from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import { slug as githubSlug } from 'github-slugger';
import { green } from 'kleur/colors';
import type { PluginContext } from 'rollup';
import type { ViteDevServer } from 'vite';
import xxhash from 'xxhash-wasm';
import { z } from 'zod';
import { AstroError, AstroErrorData, MarkdownError, errorMap } from '../core/errors/index.js';
import { isYAMLException } from '../core/errors/utils.js';
import type { Logger } from '../core/logger/core.js';
import { appendForwardSlash } from '../core/path.js';
import { normalizePath } from '../core/viteUtils.js';
import type { AstroSettings } from '../types/astro.js';
import type { AstroConfig } from '../types/public/config.js';
import type { ContentEntryType, DataEntryType } from '../types/public/content.js';
import {
	CONTENT_FLAGS,
	CONTENT_LAYER_TYPE,
	CONTENT_MODULE_FLAG,
	DEFERRED_MODULE,
	IMAGE_IMPORT_PREFIX,
	PROPAGATED_ASSET_FLAG,
} from './consts.js';
import { glob } from './loaders/glob.js';
import { createImage } from './runtime-assets.js';

/**
 * A map from a collection + slug to the local file path.
 * This is used internally to resolve entry imports when using `getEntry()`.
 * @see `templates/content/module.mjs`
 */
export type ContentLookupMap = {
	[collectionName: string]: { type: 'content' | 'data'; entries: { [lookupId: string]: string } };
};

const entryTypeSchema = z
	.object({
		id: z.string({
			invalid_type_error: 'Content entry `id` must be a string',
			// Default to empty string so we can validate properly in the loader
		}),
	})
	.passthrough();

export const loaderReturnSchema = z.union([
	z.array(entryTypeSchema),
	z.record(
		z.string(),
		z
			.object({
				id: z
					.string({
						invalid_type_error: 'Content entry `id` must be a string',
					})
					.optional(),
			})
			.passthrough(),
	),
]);

const collectionConfigParser = z.union([
	z.object({
		type: z.literal('content').optional().default('content'),
		schema: z.any().optional(),
	}),
	z.object({
		type: z.literal('data'),
		schema: z.any().optional(),
	}),
	z.object({
		type: z.literal(CONTENT_LAYER_TYPE),
		schema: z.any().optional(),
		loader: z.union([
			z.function(),
			z.object({
				name: z.string(),
				load: z.function(
					z.tuple(
						[
							z.object({
								collection: z.string(),
								store: z.any(),
								meta: z.any(),
								logger: z.any(),
								config: z.any(),
								entryTypes: z.any(),
								parseData: z.any(),
								generateDigest: z.function(z.tuple([z.any()], z.string())),
								watcher: z.any().optional(),
								refreshContextData: z.record(z.unknown()).optional(),
							}),
						],
						z.unknown(),
					),
				),
				schema: z.any().optional(),
				render: z.function(z.tuple([z.any()], z.unknown())).optional(),
			}),
		]),
		/** deprecated */
		_legacy: z.boolean().optional(),
	}),
]);

const contentConfigParser = z.object({
	collections: z.record(collectionConfigParser),
});

export type CollectionConfig = z.infer<typeof collectionConfigParser>;
export type ContentConfig = z.infer<typeof contentConfigParser> & { digest?: string };

type EntryInternal = { rawData: string | undefined; filePath: string };

export function parseEntrySlug({
	id,
	collection,
	generatedSlug,
	frontmatterSlug,
}: {
	id: string;
	collection: string;
	generatedSlug: string;
	frontmatterSlug?: unknown;
}) {
	try {
		return z.string().default(generatedSlug).parse(frontmatterSlug);
	} catch {
		throw new AstroError({
			...AstroErrorData.InvalidContentEntrySlugError,
			message: AstroErrorData.InvalidContentEntrySlugError.message(collection, id),
		});
	}
}

export async function getEntryDataAndImages<
	TInputData extends Record<string, unknown> = Record<string, unknown>,
	TOutputData extends TInputData = TInputData,
>(
	entry: {
		id: string;
		collection: string;
		unvalidatedData: TInputData;
		_internal: EntryInternal;
	},
	collectionConfig: CollectionConfig,
	shouldEmitFile: boolean,
	experimentalSvgEnabled: boolean,
	pluginContext?: PluginContext,
): Promise<{ data: TOutputData; imageImports: Array<string> }> {
	let data: TOutputData;
	// Legacy content collections have 'slug' removed
	if (collectionConfig.type === 'content' || (collectionConfig as any)._legacy) {
		const { slug, ...unvalidatedData } = entry.unvalidatedData;
		data = unvalidatedData as TOutputData;
	} else {
		data = entry.unvalidatedData as TOutputData;
	}

	let schema = collectionConfig.schema;

	const imageImports = new Set<string>();

	if (typeof schema === 'function') {
		if (pluginContext) {
			schema = schema({
				image: createImage(
					pluginContext,
					shouldEmitFile,
					entry._internal.filePath,
					experimentalSvgEnabled,
				),
			});
		} else if (collectionConfig.type === CONTENT_LAYER_TYPE) {
			schema = schema({
				image: () =>
					z.string().transform((val) => {
						imageImports.add(val);
						return `${IMAGE_IMPORT_PREFIX}${val}`;
					}),
			});
		}
	}

	if (schema) {
		// Catch reserved `slug` field inside content schemas
		// Note: will not warn for `z.union` or `z.intersection` schemas
		if (
			collectionConfig.type === 'content' &&
			typeof schema === 'object' &&
			'shape' in schema &&
			schema.shape.slug
		) {
			throw new AstroError({
				...AstroErrorData.ContentSchemaContainsSlugError,
				message: AstroErrorData.ContentSchemaContainsSlugError.message(entry.collection),
			});
		}

		// Use `safeParseAsync` to allow async transforms
		let formattedError;
		const parsed = await (schema as z.ZodSchema).safeParseAsync(data, {
			errorMap(error, ctx) {
				if (error.code === 'custom' && error.params?.isHoistedAstroError) {
					formattedError = error.params?.astroError;
				}
				return errorMap(error, ctx);
			},
		});
		if (parsed.success) {
			data = parsed.data as TOutputData;
		} else {
			if (!formattedError) {
				const errorType =
					collectionConfig.type === 'content'
						? AstroErrorData.InvalidContentEntryFrontmatterError
						: AstroErrorData.InvalidContentEntryDataError;
				formattedError = new AstroError({
					...errorType,
					message: errorType.message(entry.collection, entry.id, parsed.error),
					location: {
						file: entry._internal?.filePath,
						line: getYAMLErrorLine(
							entry._internal?.rawData,
							String(parsed.error.errors[0].path[0]),
						),
						column: 0,
					},
				});
			}
			throw formattedError;
		}
	}

	return { data, imageImports: Array.from(imageImports) };
}

export async function getEntryData(
	entry: {
		id: string;
		collection: string;
		unvalidatedData: Record<string, unknown>;
		_internal: EntryInternal;
	},
	collectionConfig: CollectionConfig,
	shouldEmitFile: boolean,
	experimentalSvgEnabled: boolean,
	pluginContext?: PluginContext,
) {
	const { data } = await getEntryDataAndImages(
		entry,
		collectionConfig,
		shouldEmitFile,
		experimentalSvgEnabled,
		pluginContext,
	);
	return data;
}

export function getContentEntryExts(settings: Pick<AstroSettings, 'contentEntryTypes'>) {
	return settings.contentEntryTypes.map((t) => t.extensions).flat();
}

export function getDataEntryExts(settings: Pick<AstroSettings, 'dataEntryTypes'>) {
	return settings.dataEntryTypes.map((t) => t.extensions).flat();
}

export function getEntryConfigByExtMap<TEntryType extends ContentEntryType | DataEntryType>(
	entryTypes: TEntryType[],
): Map<string, TEntryType> {
	const map = new Map<string, TEntryType>();
	for (const entryType of entryTypes) {
		for (const ext of entryType.extensions) {
			map.set(ext, entryType);
		}
	}
	return map;
}

export async function getSymlinkedContentCollections({
	contentDir,
	logger,
	fs,
}: {
	contentDir: URL;
	logger: Logger;
	fs: typeof fsMod;
}): Promise<Map<string, string>> {
	const contentPaths = new Map<string, string>();
	const contentDirPath = fileURLToPath(contentDir);
	try {
		if (!fs.existsSync(contentDirPath) || !fs.lstatSync(contentDirPath).isDirectory()) {
			return contentPaths;
		}
	} catch {
		// Ignore if there isn't a valid content directory
		return contentPaths;
	}
	try {
		const contentDirEntries = await fs.promises.readdir(contentDir, { withFileTypes: true });
		for (const entry of contentDirEntries) {
			if (entry.isSymbolicLink()) {
				const entryPath = path.join(contentDirPath, entry.name);
				const realPath = await fs.promises.realpath(entryPath);
				contentPaths.set(normalizePath(realPath), entry.name);
			}
		}
	} catch (e) {
		logger.warn('content', `Error when reading content directory "${contentDir}"`);
		logger.debug('content', e);
		// If there's an error, return an empty map
		return new Map<string, string>();
	}

	return contentPaths;
}

export function reverseSymlink({
	entry,
	symlinks,
	contentDir,
}: {
	entry: string | URL;
	contentDir: string | URL;
	symlinks?: Map<string, string>;
}): string {
	const entryPath = normalizePath(typeof entry === 'string' ? entry : fileURLToPath(entry));
	const contentDirPath = typeof contentDir === 'string' ? contentDir : fileURLToPath(contentDir);
	if (!symlinks || symlinks.size === 0) {
		return entryPath;
	}

	for (const [realPath, symlinkName] of symlinks) {
		if (entryPath.startsWith(realPath)) {
			return normalizePath(path.join(contentDirPath, symlinkName, entryPath.replace(realPath, '')));
		}
	}
	return entryPath;
}

export function getEntryCollectionName({
	contentDir,
	entry,
}: Pick<ContentPaths, 'contentDir'> & { entry: string | URL }) {
	const entryPath = typeof entry === 'string' ? entry : fileURLToPath(entry);
	const rawRelativePath = path.relative(fileURLToPath(contentDir), entryPath);
	const collectionName = path.dirname(rawRelativePath).split(path.sep)[0];
	const isOutsideCollection =
		!collectionName || collectionName === '' || collectionName === '..' || collectionName === '.';

	if (isOutsideCollection) {
		return undefined;
	}

	return collectionName;
}

export function getDataEntryId({
	entry,
	contentDir,
	collection,
}: Pick<ContentPaths, 'contentDir'> & { entry: URL; collection: string }): string {
	const relativePath = getRelativeEntryPath(entry, collection, contentDir);
	const withoutFileExt = normalizePath(relativePath).replace(
		new RegExp(path.extname(relativePath) + '$'),
		'',
	);

	return withoutFileExt;
}

export function getContentEntryIdAndSlug({
	entry,
	contentDir,
	collection,
}: Pick<ContentPaths, 'contentDir'> & { entry: URL; collection: string }): {
	id: string;
	slug: string;
} {
	const relativePath = getRelativeEntryPath(entry, collection, contentDir);
	const withoutFileExt = relativePath.replace(new RegExp(path.extname(relativePath) + '$'), '');
	const rawSlugSegments = withoutFileExt.split(path.sep);

	const slug = rawSlugSegments
		// Slugify each route segment to handle capitalization and spaces.
		// Note: using `slug` instead of `new Slugger()` means no slug deduping.
		.map((segment) => githubSlug(segment))
		.join('/')
		.replace(/\/index$/, '');

	const res = {
		id: normalizePath(relativePath),
		slug,
	};
	return res;
}

function getRelativeEntryPath(entry: URL, collection: string, contentDir: URL) {
	const relativeToContent = path.relative(fileURLToPath(contentDir), fileURLToPath(entry));
	const relativeToCollection = path.relative(collection, relativeToContent);
	return relativeToCollection;
}

function isParentDirectory(parent: URL, child: URL) {
	const relative = path.relative(fileURLToPath(parent), fileURLToPath(child));
	return !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function getEntryType(
	entryPath: string,
	paths: Pick<ContentPaths, 'config' | 'contentDir' | 'root'>,
	contentFileExts: string[],
	dataFileExts: string[],
): 'content' | 'data' | 'config' | 'ignored' {
	const { ext } = path.parse(entryPath);
	const fileUrl = pathToFileURL(entryPath);

	const dotAstroDir = new URL('./.astro/', paths.root);

	if (fileUrl.href === paths.config.url.href) {
		return 'config';
	} else if (hasUnderscoreBelowContentDirectoryPath(fileUrl, paths.contentDir)) {
		return 'ignored';
	} else if (isParentDirectory(dotAstroDir, fileUrl)) {
		return 'ignored';
	} else if (contentFileExts.includes(ext)) {
		return 'content';
	} else if (dataFileExts.includes(ext)) {
		return 'data';
	} else {
		return 'ignored';
	}
}

function hasUnderscoreBelowContentDirectoryPath(
	fileUrl: URL,
	contentDir: ContentPaths['contentDir'],
): boolean {
	const parts = fileUrl.pathname.replace(contentDir.pathname, '').split('/');
	for (const part of parts) {
		if (part.startsWith('_')) return true;
	}
	return false;
}

function getYAMLErrorLine(rawData: string | undefined, objectKey: string) {
	if (!rawData) return 0;
	const indexOfObjectKey = rawData.search(
		// Match key either at the top of the file or after a newline
		// Ensures matching on top-level object keys only
		new RegExp(`(\n|^)${objectKey}`),
	);
	if (indexOfObjectKey === -1) return 0;

	const dataBeforeKey = rawData.substring(0, indexOfObjectKey + 1);
	const numNewlinesBeforeKey = dataBeforeKey.split('\n').length;
	return numNewlinesBeforeKey;
}

export function safeParseFrontmatter(source: string, id?: string) {
	try {
		return parseFrontmatter(source, { frontmatter: 'empty-with-spaces' });
	} catch (err: any) {
		const markdownError = new MarkdownError({
			name: 'MarkdownError',
			message: err.message,
			stack: err.stack,
			location: id
				? {
						file: id,
					}
				: undefined,
		});

		if (isYAMLException(err)) {
			markdownError.setLocation({
				file: id,
				line: err.mark.line,
				column: err.mark.column,
			});

			markdownError.setMessage(err.reason);
		}

		throw markdownError;
	}
}

/**
 * The content config is loaded separately from other `src/` files.
 * This global observable lets dependent plugins (like the content flag plugin)
 * subscribe to changes during dev server updates.
 */
export const globalContentConfigObserver = contentObservable({ status: 'init' });

export function hasAnyContentFlag(viteId: string): boolean {
	const flags = new URLSearchParams(viteId.split('?')[1] ?? '');
	const flag = Array.from(flags.keys()).at(0);
	if (typeof flag !== 'string') {
		return false;
	}
	return CONTENT_FLAGS.includes(flag as any);
}

export function hasContentFlag(viteId: string, flag: (typeof CONTENT_FLAGS)[number]): boolean {
	const flags = new URLSearchParams(viteId.split('?')[1] ?? '');
	return flags.has(flag);
}

export function isDeferredModule(viteId: string): boolean {
	const flags = new URLSearchParams(viteId.split('?')[1] ?? '');
	return flags.has(CONTENT_MODULE_FLAG);
}

async function loadContentConfig({
	fs,
	settings,
	viteServer,
}: {
	fs: typeof fsMod;
	settings: AstroSettings;
	viteServer: ViteDevServer;
}): Promise<ContentConfig | undefined> {
	const contentPaths = getContentPaths(settings.config, fs);
	let unparsedConfig;
	if (!contentPaths.config.exists) {
		return undefined;
	}
	const configPathname = fileURLToPath(contentPaths.config.url);
	unparsedConfig = await viteServer.ssrLoadModule(configPathname);

	const config = contentConfigParser.safeParse(unparsedConfig);
	if (config.success) {
		// Generate a digest of the config file so we can invalidate the cache if it changes
		const hasher = await xxhash();
		const digest = await hasher.h64ToString(await fs.promises.readFile(configPathname, 'utf-8'));
		return { ...config.data, digest };
	} else {
		return undefined;
	}
}

export async function autogenerateCollections({
	config,
	settings,
	fs,
}: {
	config?: ContentConfig;
	settings: AstroSettings;
	fs: typeof fsMod;
}): Promise<ContentConfig | undefined> {
	if (settings.config.legacy.collections) {
		return config;
	}
	const contentDir = new URL('./content/', settings.config.srcDir);

	const collections: Record<string, CollectionConfig> = config?.collections ?? {};

	const contentExts = getContentEntryExts(settings);
	const dataExts = getDataEntryExts(settings);

	const contentPattern = globWithUnderscoresIgnored('', contentExts);
	const dataPattern = globWithUnderscoresIgnored('', dataExts);
	let usesContentLayer = false;
	for (const collectionName of Object.keys(collections)) {
		if (collections[collectionName]?.type === 'content_layer') {
			usesContentLayer = true;
			// This is already a content layer, skip
			continue;
		}

		const isDataCollection = collections[collectionName]?.type === 'data';
		const base = new URL(`${collectionName}/`, contentDir);
		// Only "content" collections need special legacy handling
		const _legacy = !isDataCollection || undefined;
		collections[collectionName] = {
			...collections[collectionName],
			type: 'content_layer',
			_legacy,
			loader: glob({
				base,
				pattern: isDataCollection ? dataPattern : contentPattern,
				_legacy,
				// Legacy data collections IDs aren't slugified
				generateId: isDataCollection
					? ({ entry }) =>
							getDataEntryId({
								entry: new URL(entry, base),
								collection: collectionName,
								contentDir,
							})
					: undefined,

				// Zod weirdness has trouble with typing the args to the load function
			}) as any,
		};
	}
	if (!usesContentLayer && fs.existsSync(contentDir)) {
		// If the user hasn't defined any collections using the content layer, we'll try and help out by checking for
		// any orphaned folders in the content directory and creating collections for them.
		const orphanedCollections = [];
		for (const entry of await fs.promises.readdir(contentDir, { withFileTypes: true })) {
			const collectionName = entry.name;
			if (['_', '.'].includes(collectionName.at(0) ?? '')) {
				continue;
			}
			if (entry.isDirectory() && !(collectionName in collections)) {
				orphanedCollections.push(collectionName);
				const base = new URL(`${collectionName}/`, contentDir);
				collections[collectionName] = {
					type: 'content_layer',
					loader: glob({
						base,
						pattern: contentPattern,
						_legacy: true,
					}) as any,
				};
			}
		}
		if (orphanedCollections.length > 0) {
			console.warn(
				`
Auto-generating collections for folders in "src/content/" that are not defined as collections.
This is deprecated, so you should define these collections yourself in "src/content.config.ts".
The following collections have been auto-generated: ${orphanedCollections
					.map((name) => green(name))
					.join(', ')}\n`,
			);
		}
	}
	return { ...config, collections };
}

export async function reloadContentConfigObserver({
	observer = globalContentConfigObserver,
	...loadContentConfigOpts
}: {
	fs: typeof fsMod;
	settings: AstroSettings;
	viteServer: ViteDevServer;
	observer?: ContentObservable;
}) {
	observer.set({ status: 'loading' });
	try {
		let config = await loadContentConfig(loadContentConfigOpts);

		config = await autogenerateCollections({
			config,
			...loadContentConfigOpts,
		});

		if (config) {
			observer.set({ status: 'loaded', config });
		} else {
			observer.set({ status: 'does-not-exist' });
		}
	} catch (e) {
		observer.set({
			status: 'error',
			error: e instanceof Error ? e : new AstroError(AstroErrorData.UnknownContentCollectionError),
		});
	}
}

type ContentCtx =
	| { status: 'init' }
	| { status: 'loading' }
	| { status: 'does-not-exist' }
	| { status: 'loaded'; config: ContentConfig }
	| { status: 'error'; error: Error };

type Observable<C> = {
	get: () => C;
	set: (ctx: C) => void;
	subscribe: (fn: (ctx: C) => void) => () => void;
};

export type ContentObservable = Observable<ContentCtx>;

export function contentObservable(initialCtx: ContentCtx): ContentObservable {
	type Subscriber = (ctx: ContentCtx) => void;
	const subscribers = new Set<Subscriber>();
	let ctx = initialCtx;
	function get() {
		return ctx;
	}
	function set(_ctx: ContentCtx) {
		ctx = _ctx;
		subscribers.forEach((fn) => fn(ctx));
	}
	function subscribe(fn: Subscriber) {
		subscribers.add(fn);
		return () => {
			subscribers.delete(fn);
		};
	}
	return {
		get,
		set,
		subscribe,
	};
}

export type ContentPaths = {
	root: URL;
	contentDir: URL;
	assetsDir: URL;
	typesTemplate: URL;
	virtualModTemplate: URL;
	config: {
		exists: boolean;
		url: URL;
	};
};

export function getContentPaths(
	{ srcDir, legacy, root }: Pick<AstroConfig, 'root' | 'srcDir' | 'legacy'>,
	fs: typeof fsMod = fsMod,
): ContentPaths {
	const configStats = search(fs, srcDir, legacy?.collections);
	const pkgBase = new URL('../../', import.meta.url);
	return {
		root: new URL('./', root),
		contentDir: new URL('./content/', srcDir),
		assetsDir: new URL('./assets/', srcDir),
		typesTemplate: new URL('templates/content/types.d.ts', pkgBase),
		virtualModTemplate: new URL('templates/content/module.mjs', pkgBase),
		config: configStats,
	};
}
function search(fs: typeof fsMod, srcDir: URL, legacy?: boolean) {
	const paths = [
		...(legacy
			? []
			: ['content.config.mjs', 'content.config.js', 'content.config.mts', 'content.config.ts']),
		'content/config.mjs',
		'content/config.js',
		'content/config.mts',
		'content/config.ts',
	].map((p) => new URL(`./${p}`, srcDir));
	for (const file of paths) {
		if (fs.existsSync(file)) {
			return { exists: true, url: file };
		}
	}
	return { exists: false, url: paths[0] };
}

/**
 * Check for slug in content entry frontmatter and validate the type,
 * falling back to the `generatedSlug` if none is found.
 */
export async function getEntrySlug({
	id,
	collection,
	generatedSlug,
	contentEntryType,
	fileUrl,
	fs,
}: {
	fs: typeof fsMod;
	id: string;
	collection: string;
	generatedSlug: string;
	fileUrl: URL;
	contentEntryType: Pick<ContentEntryType, 'getEntryInfo'>;
}) {
	let contents: string;
	try {
		contents = await fs.promises.readFile(fileUrl, 'utf-8');
	} catch (e) {
		// File contents should exist. Raise unexpected error as "unknown" if not.
		throw new AstroError(AstroErrorData.UnknownContentCollectionError, { cause: e });
	}
	const { slug: frontmatterSlug } = await contentEntryType.getEntryInfo({
		fileUrl,
		contents,
	});
	return parseEntrySlug({ generatedSlug, frontmatterSlug, id, collection });
}

export function getExtGlob(exts: string[]) {
	return exts.length === 1
		? // Wrapping {...} breaks when there is only one extension
			exts[0]
		: `{${exts.join(',')}}`;
}

export function hasAssetPropagationFlag(id: string): boolean {
	try {
		return new URL(id, 'file://').searchParams.has(PROPAGATED_ASSET_FLAG);
	} catch {
		return false;
	}
}

export function globWithUnderscoresIgnored(relContentDir: string, exts: string[]): string[] {
	const extGlob = getExtGlob(exts);
	const contentDir = relContentDir.length > 0 ? appendForwardSlash(relContentDir) : relContentDir;
	return [
		`${contentDir}**/*${extGlob}`,
		`!${contentDir}**/_*/**/*${extGlob}`,
		`!${contentDir}**/_*${extGlob}`,
	];
}

/**
 * Convert a platform path to a posix path.
 */
export function posixifyPath(filePath: string) {
	return filePath.split(path.sep).join('/');
}

/**
 * Unlike `path.posix.relative`, this function will accept a platform path and return a posix path.
 */
export function posixRelative(from: string, to: string) {
	return posixifyPath(path.relative(from, to));
}

export function contentModuleToId(fileName: string) {
	const params = new URLSearchParams(DEFERRED_MODULE);
	params.set('fileName', fileName);
	params.set(CONTENT_MODULE_FLAG, 'true');
	return `${DEFERRED_MODULE}?${params.toString()}`;
}

// Based on https://github.com/sindresorhus/safe-stringify
function safeStringifyReplacer(seen: WeakSet<object>) {
	return function (_key: string, value: unknown) {
		if (!(value !== null && typeof value === 'object')) {
			return value;
		}
		if (seen.has(value)) {
			return '[Circular]';
		}
		seen.add(value);
		const newValue = Array.isArray(value) ? [] : {};
		for (const [key2, value2] of Object.entries(value)) {
			(newValue as Record<string, unknown>)[key2] = safeStringifyReplacer(seen)(key2, value2);
		}
		seen.delete(value);
		return newValue;
	};
}
export function safeStringify(value: unknown) {
	const seen = new WeakSet();
	return JSON.stringify(value, safeStringifyReplacer(seen));
}

import nodeFs from 'node:fs';
import { extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dataToEsm } from '@rollup/pluginutils';
import glob from 'fast-glob';
import pLimit from 'p-limit';
import type { Plugin, ViteDevServer } from 'vite';
import { AstroError, AstroErrorData } from '../core/errors/index.js';
import { rootRelativePath } from '../core/viteUtils.js';
import type { AstroSettings } from '../types/astro.js';
import type { AstroPluginMetadata } from '../vite-plugin-astro/index.js';
import { createDefaultAstroMetadata } from '../vite-plugin-astro/metadata.js';
import {
	ASSET_IMPORTS_FILE,
	ASSET_IMPORTS_RESOLVED_STUB_ID,
	ASSET_IMPORTS_VIRTUAL_ID,
	CONTENT_FLAG,
	CONTENT_RENDER_FLAG,
	DATA_FLAG,
	DATA_STORE_VIRTUAL_ID,
	MODULES_IMPORTS_FILE,
	MODULES_MJS_ID,
	MODULES_MJS_VIRTUAL_ID,
	RESOLVED_DATA_STORE_VIRTUAL_ID,
	RESOLVED_VIRTUAL_MODULE_ID,
	VIRTUAL_MODULE_ID,
} from './consts.js';
import { getDataStoreFile } from './content-layer.js';
import {
	type ContentLookupMap,
	getContentEntryIdAndSlug,
	getContentPaths,
	getDataEntryExts,
	getDataEntryId,
	getEntryCollectionName,
	getEntryConfigByExtMap,
	getEntrySlug,
	getEntryType,
	getExtGlob,
	globWithUnderscoresIgnored,
	isDeferredModule,
} from './utils.js';

interface AstroContentVirtualModPluginParams {
	settings: AstroSettings;
	fs: typeof nodeFs;
}

function invalidateDataStore(server: ViteDevServer) {
	const module = server.moduleGraph.getModuleById(RESOLVED_DATA_STORE_VIRTUAL_ID);
	if (module) {
		server.moduleGraph.invalidateModule(module);
	}
	server.ws.send({
		type: 'full-reload',
		path: '*',
	});
}

export function astroContentVirtualModPlugin({
	settings,
	fs,
}: AstroContentVirtualModPluginParams): Plugin {
	let dataStoreFile: URL;
	let devServer: ViteDevServer;
	return {
		name: 'astro-content-virtual-mod-plugin',
		enforce: 'pre',
		config(_, env) {
			dataStoreFile = getDataStoreFile(settings, env.command === 'serve');
		},
		buildStart() {
			if (devServer) {
				// We defer adding the data store file to the watcher until the server is ready
				devServer.watcher.add(fileURLToPath(dataStoreFile));
				// Manually invalidate the data store to avoid a race condition in file watching
				invalidateDataStore(devServer);
			}
		},
		async resolveId(id) {
			if (id === VIRTUAL_MODULE_ID) {
				return RESOLVED_VIRTUAL_MODULE_ID;
			}
			if (id === DATA_STORE_VIRTUAL_ID) {
				return RESOLVED_DATA_STORE_VIRTUAL_ID;
			}

			if (isDeferredModule(id)) {
				const [, query] = id.split('?');
				const params = new URLSearchParams(query);
				const fileName = params.get('fileName');
				let importPath = undefined;
				if (fileName && URL.canParse(fileName, settings.config.root.toString())) {
					importPath = fileURLToPath(new URL(fileName, settings.config.root));
				}
				if (importPath) {
					return await this.resolve(`${importPath}?${CONTENT_RENDER_FLAG}`);
				}
			}

			if (id === MODULES_MJS_ID) {
				const modules = new URL(MODULES_IMPORTS_FILE, settings.dotAstroDir);
				if (fs.existsSync(modules)) {
					return fileURLToPath(modules);
				}
				return MODULES_MJS_VIRTUAL_ID;
			}

			if (id === ASSET_IMPORTS_VIRTUAL_ID) {
				const assetImportsFile = new URL(ASSET_IMPORTS_FILE, settings.dotAstroDir);
				if (fs.existsSync(assetImportsFile)) {
					return fileURLToPath(assetImportsFile);
				}
				return ASSET_IMPORTS_RESOLVED_STUB_ID;
			}
		},
		async load(id, args) {
			if (id === RESOLVED_VIRTUAL_MODULE_ID) {
				const lookupMap = settings.config.legacy.collections
					? await generateLookupMap({
							settings,
							fs,
						})
					: {};
				const isClient = !args?.ssr;
				const code = await generateContentEntryFile({
					settings,
					fs,
					lookupMap,
					isClient,
				});

				const astro = createDefaultAstroMetadata();
				astro.propagation = 'in-tree';
				return {
					code,
					meta: {
						astro,
					} satisfies AstroPluginMetadata,
				};
			}
			if (id === RESOLVED_DATA_STORE_VIRTUAL_ID) {
				if (!fs.existsSync(dataStoreFile)) {
					return 'export default new Map()';
				}
				const jsonData = await fs.promises.readFile(dataStoreFile, 'utf-8');

				try {
					const parsed = JSON.parse(jsonData);
					return {
						code: dataToEsm(parsed, {
							compact: true,
						}),
						map: { mappings: '' },
					};
				} catch (err) {
					const message = 'Could not parse JSON file';
					this.error({ message, id, cause: err });
				}
			}

			if (id === ASSET_IMPORTS_RESOLVED_STUB_ID) {
				const assetImportsFile = new URL(ASSET_IMPORTS_FILE, settings.dotAstroDir);
				if (!fs.existsSync(assetImportsFile)) {
					return 'export default new Map()';
				}
				return fs.readFileSync(assetImportsFile, 'utf-8');
			}

			if (id === MODULES_MJS_VIRTUAL_ID) {
				const modules = new URL(MODULES_IMPORTS_FILE, settings.dotAstroDir);
				if (!fs.existsSync(modules)) {
					return 'export default new Map()';
				}
				return fs.readFileSync(modules, 'utf-8');
			}
		},

		configureServer(server) {
			devServer = server;
			const dataStorePath = fileURLToPath(dataStoreFile);
			// If the datastore file changes, invalidate the virtual module

			server.watcher.on('add', (addedPath) => {
				if (addedPath === dataStorePath) {
					invalidateDataStore(server);
				}
			});

			server.watcher.on('change', (changedPath) => {
				if (changedPath === dataStorePath) {
					invalidateDataStore(server);
				}
			});
		},
	};
}

export async function generateContentEntryFile({
	settings,
	lookupMap,
	isClient,
}: {
	settings: AstroSettings;
	fs: typeof nodeFs;
	lookupMap: ContentLookupMap;
	isClient: boolean;
}) {
	const contentPaths = getContentPaths(settings.config);
	const relContentDir = rootRelativePath(settings.config.root, contentPaths.contentDir);

	let contentEntryGlobResult = '""';
	let dataEntryGlobResult = '""';
	let renderEntryGlobResult = '""';
	if (settings.config.legacy.collections) {
		const contentEntryConfigByExt = getEntryConfigByExtMap(settings.contentEntryTypes);
		const contentEntryExts = [...contentEntryConfigByExt.keys()];
		const dataEntryExts = getDataEntryExts(settings);
		const createGlob = (value: string[], flag: string) =>
			`import.meta.glob(${JSON.stringify(value)}, { query: { ${flag}: true } })`;
		contentEntryGlobResult = createGlob(
			globWithUnderscoresIgnored(relContentDir, contentEntryExts),
			CONTENT_FLAG,
		);
		dataEntryGlobResult = createGlob(
			globWithUnderscoresIgnored(relContentDir, dataEntryExts),
			DATA_FLAG,
		);
		renderEntryGlobResult = createGlob(
			globWithUnderscoresIgnored(relContentDir, contentEntryExts),
			CONTENT_RENDER_FLAG,
		);
	}

	let virtualModContents: string;
	if (isClient) {
		throw new AstroError({
			...AstroErrorData.ServerOnlyModule,
			message: AstroErrorData.ServerOnlyModule.message('astro:content'),
		});
	} else {
		virtualModContents = nodeFs
			.readFileSync(contentPaths.virtualModTemplate, 'utf-8')
			.replace('@@CONTENT_DIR@@', relContentDir)
			.replace("'@@CONTENT_ENTRY_GLOB_PATH@@'", contentEntryGlobResult)
			.replace("'@@DATA_ENTRY_GLOB_PATH@@'", dataEntryGlobResult)
			.replace("'@@RENDER_ENTRY_GLOB_PATH@@'", renderEntryGlobResult)
			.replace('/* @@LOOKUP_MAP_ASSIGNMENT@@ */', `lookupMap = ${JSON.stringify(lookupMap)};`);
	}

	return virtualModContents;
}

/**
 * Generate a map from a collection + slug to the local file path.
 * This is used internally to resolve entry imports when using `getEntry()`.
 * @see `templates/content/module.mjs`
 */
export async function generateLookupMap({
	settings,
	fs,
}: {
	settings: AstroSettings;
	fs: typeof nodeFs;
}) {
	const { root } = settings.config;
	const contentPaths = getContentPaths(settings.config);
	const relContentDir = rootRelativePath(root, contentPaths.contentDir, false);

	const contentEntryConfigByExt = getEntryConfigByExtMap(settings.contentEntryTypes);
	const dataEntryExts = getDataEntryExts(settings);

	const { contentDir } = contentPaths;

	const contentEntryExts = [...contentEntryConfigByExt.keys()];

	let lookupMap: ContentLookupMap = {};
	const contentGlob = await glob(
		`${relContentDir}**/*${getExtGlob([...dataEntryExts, ...contentEntryExts])}`,
		{
			absolute: true,
			cwd: fileURLToPath(root),
			fs,
		},
	);

	// Run 10 at a time to prevent `await getEntrySlug` from accessing the filesystem all at once.
	// Each await shouldn't take too long for the work to be noticeably slow too.
	const limit = pLimit(10);
	const promises: Promise<void>[] = [];

	for (const filePath of contentGlob) {
		promises.push(
			limit(async () => {
				const entryType = getEntryType(filePath, contentPaths, contentEntryExts, dataEntryExts);
				// Globbed ignored or unsupported entry.
				// Logs warning during type generation, should ignore in lookup map.
				if (entryType !== 'content' && entryType !== 'data') return;

				const collection = getEntryCollectionName({ contentDir, entry: pathToFileURL(filePath) });
				if (!collection) throw UnexpectedLookupMapError;

				if (lookupMap[collection]?.type && lookupMap[collection].type !== entryType) {
					throw new AstroError({
						...AstroErrorData.MixedContentDataCollectionError,
						message: AstroErrorData.MixedContentDataCollectionError.message(collection),
					});
				}

				if (entryType === 'content') {
					const contentEntryType = contentEntryConfigByExt.get(extname(filePath));
					if (!contentEntryType) throw UnexpectedLookupMapError;

					const { id, slug: generatedSlug } = getContentEntryIdAndSlug({
						entry: pathToFileURL(filePath),
						contentDir,
						collection,
					});
					const slug = await getEntrySlug({
						id,
						collection,
						generatedSlug,
						fs,
						fileUrl: pathToFileURL(filePath),
						contentEntryType,
					});
					if (lookupMap[collection]?.entries?.[slug]) {
						throw new AstroError({
							...AstroErrorData.DuplicateContentEntrySlugError,
							message: AstroErrorData.DuplicateContentEntrySlugError.message(
								collection,
								slug,
								lookupMap[collection].entries[slug],
								rootRelativePath(root, filePath),
							),
							hint:
								slug !== generatedSlug
									? `Check the \`slug\` frontmatter property in **${id}**.`
									: undefined,
						});
					}
					lookupMap[collection] = {
						type: 'content',
						entries: {
							...lookupMap[collection]?.entries,
							[slug]: rootRelativePath(root, filePath),
						},
					};
				} else {
					const id = getDataEntryId({ entry: pathToFileURL(filePath), contentDir, collection });
					lookupMap[collection] = {
						type: 'data',
						entries: {
							...lookupMap[collection]?.entries,
							[id]: rootRelativePath(root, filePath),
						},
					};
				}
			}),
		);
	}

	await Promise.all(promises);
	return lookupMap;
}

const UnexpectedLookupMapError = new AstroError({
	...AstroErrorData.UnknownContentCollectionError,
	message: `Unexpected error while parsing content entry IDs and slugs.`,
});

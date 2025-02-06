import { fileURLToPath } from 'node:url';
import glob from 'fast-glob';
import type { OutputChunk } from 'rollup';
import type { Plugin as VitePlugin } from 'vite';
import { getAssetsPrefix } from '../../../assets/utils/getAssetsPrefix.js';
import { normalizeTheLocale } from '../../../i18n/index.js';
import { toFallbackType, toRoutingStrategy } from '../../../i18n/utils.js';
import { runHookBuildSsr } from '../../../integrations/hooks.js';
import { BEFORE_HYDRATION_SCRIPT_ID, PAGE_SCRIPT_ID } from '../../../vite-plugin-scripts/index.js';
import type {
	SSRManifestI18n,
	SerializedRouteInfo,
	SerializedSSRManifest,
} from '../../app/types.js';
import { encodeKey } from '../../encryption.js';
import { fileExtension, joinPaths, prependForwardSlash } from '../../path.js';
import { DEFAULT_COMPONENTS } from '../../routing/default.js';
import { serializeRouteData } from '../../routing/index.js';
import { resolveSessionDriver } from '../../session.js';
import { addRollupInput } from '../add-rollup-input.js';
import { getOutFile, getOutFolder } from '../common.js';
import { type BuildInternals, cssOrder, mergeInlineCss } from '../internal.js';
import type { AstroBuildPlugin } from '../plugin.js';
import type { StaticBuildOptions } from '../types.js';
import { makePageDataKey } from './util.js';

const manifestReplace = '@@ASTRO_MANIFEST_REPLACE@@';
const replaceExp = new RegExp(`['"]${manifestReplace}['"]`, 'g');

export const SSR_MANIFEST_VIRTUAL_MODULE_ID = '@astrojs-manifest';
export const RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID = '\0' + SSR_MANIFEST_VIRTUAL_MODULE_ID;

function vitePluginManifest(options: StaticBuildOptions, internals: BuildInternals): VitePlugin {
	return {
		name: '@astro/plugin-build-manifest',
		enforce: 'post',
		options(opts) {
			return addRollupInput(opts, [SSR_MANIFEST_VIRTUAL_MODULE_ID]);
		},
		resolveId(id) {
			if (id === SSR_MANIFEST_VIRTUAL_MODULE_ID) {
				return RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID;
			}
		},
		augmentChunkHash(chunkInfo) {
			if (chunkInfo.facadeModuleId === RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID) {
				return Date.now().toString();
			}
		},
		async load(id) {
			if (id === RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID) {
				const imports = [
					`import { deserializeManifest as _deserializeManifest } from 'astro/app'`,
					`import { _privateSetManifestDontUseThis } from 'astro:ssr-manifest'`,
				];

				const resolvedDriver = await resolveSessionDriver(
					options.settings.config.experimental?.session?.driver,
				);

				const contents = [
					`const manifest = _deserializeManifest('${manifestReplace}');`,
					`if (manifest.sessionConfig) manifest.sessionConfig.driverModule = ${resolvedDriver ? `() => import(${JSON.stringify(resolvedDriver)})` : 'null'};`,
					`_privateSetManifestDontUseThis(manifest);`,
				];
				const exports = [`export { manifest }`];

				return [...imports, ...contents, ...exports].join('\n');
			}
		},

		async generateBundle(_opts, bundle) {
			for (const [chunkName, chunk] of Object.entries(bundle)) {
				if (chunk.type === 'asset') {
					continue;
				}
				if (chunk.modules[RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID]) {
					internals.manifestEntryChunk = chunk;
					delete bundle[chunkName];
				}
				if (chunkName.startsWith('manifest')) {
					internals.manifestFileName = chunkName;
				}
			}
		},
	};
}

export function pluginManifest(
	options: StaticBuildOptions,
	internals: BuildInternals,
): AstroBuildPlugin {
	return {
		targets: ['server'],
		hooks: {
			'build:before': () => {
				return {
					vitePlugin: vitePluginManifest(options, internals),
				};
			},

			'build:post': async ({ mutate }) => {
				if (!internals.manifestEntryChunk) {
					throw new Error(`Did not generate an entry chunk for SSR`);
				}

				const manifest = await createManifest(options, internals);
				const shouldPassMiddlewareEntryPoint =
					options.settings.adapter?.adapterFeatures?.edgeMiddleware;
				await runHookBuildSsr({
					config: options.settings.config,
					manifest,
					logger: options.logger,
					entryPoints: internals.entryPoints,
					middlewareEntryPoint: shouldPassMiddlewareEntryPoint
						? internals.middlewareEntryPoint
						: undefined,
				});
				const code = injectManifest(manifest, internals.manifestEntryChunk);
				mutate(internals.manifestEntryChunk, ['server'], code);
			},
		},
	};
}

async function createManifest(
	buildOpts: StaticBuildOptions,
	internals: BuildInternals,
): Promise<SerializedSSRManifest> {
	if (!internals.manifestEntryChunk) {
		throw new Error(`Did not generate an entry chunk for SSR`);
	}

	// Add assets from the client build.
	const clientStatics = new Set(
		await glob('**/*', {
			cwd: fileURLToPath(buildOpts.settings.config.build.client),
		}),
	);
	for (const file of clientStatics) {
		internals.staticFiles.add(file);
	}

	const staticFiles = internals.staticFiles;
	const encodedKey = await encodeKey(await buildOpts.key);
	return buildManifest(buildOpts, internals, Array.from(staticFiles), encodedKey);
}

/**
 * It injects the manifest in the given output rollup chunk. It returns the new emitted code
 */
function injectManifest(manifest: SerializedSSRManifest, chunk: Readonly<OutputChunk>) {
	const code = chunk.code;

	return code.replace(replaceExp, () => {
		return JSON.stringify(manifest);
	});
}

function buildManifest(
	opts: StaticBuildOptions,
	internals: BuildInternals,
	staticFiles: string[],
	encodedKey: string,
): SerializedSSRManifest {
	const { settings } = opts;

	const routes: SerializedRouteInfo[] = [];
	const domainLookupTable: Record<string, string> = {};
	const entryModules = Object.fromEntries(internals.entrySpecifierToBundleMap.entries());
	if (settings.scripts.some((script) => script.stage === 'page')) {
		staticFiles.push(entryModules[PAGE_SCRIPT_ID]);
	}

	const prefixAssetPath = (pth: string) => {
		if (settings.config.build.assetsPrefix) {
			const pf = getAssetsPrefix(fileExtension(pth), settings.config.build.assetsPrefix);
			return joinPaths(pf, pth);
		} else {
			return prependForwardSlash(joinPaths(settings.config.base, pth));
		}
	};

	// Default components follow a special flow during build. We prevent their processing earlier
	// in the build. As a result, they are not present on `internals.pagesByKeys` and not serialized
	// in the manifest file. But we need them in the manifest, so we handle them here
	for (const route of opts.routesList.routes) {
		if (!DEFAULT_COMPONENTS.find((component) => route.component === component)) {
			continue;
		}
		routes.push({
			file: '',
			links: [],
			scripts: [],
			styles: [],
			routeData: serializeRouteData(route, settings.config.trailingSlash),
		});
	}

	for (const route of opts.routesList.routes) {
		if (!route.prerender) continue;
		if (!route.pathname) continue;

		const outFolder = getOutFolder(opts.settings, route.pathname, route);
		const outFile = getOutFile(opts.settings.config, outFolder, route.pathname, route);
		const file = outFile.toString().replace(opts.settings.config.build.client.toString(), '');
		routes.push({
			file,
			links: [],
			scripts: [],
			styles: [],
			routeData: serializeRouteData(route, settings.config.trailingSlash),
		});
		staticFiles.push(file);
	}

	for (const route of opts.routesList.routes) {
		const pageData = internals.pagesByKeys.get(makePageDataKey(route.route, route.component));
		if (route.prerender || !pageData) continue;
		const scripts: SerializedRouteInfo['scripts'] = [];
		if (settings.scripts.some((script) => script.stage === 'page')) {
			const src = entryModules[PAGE_SCRIPT_ID];

			scripts.push({
				type: 'external',
				value: prefixAssetPath(src),
			});
		}

		// may be used in the future for handling rel=modulepreload, rel=icon, rel=manifest etc.
		const links: [] = [];

		const styles = pageData.styles
			.sort(cssOrder)
			.map(({ sheet }) => sheet)
			.map((s) => (s.type === 'external' ? { ...s, src: prefixAssetPath(s.src) } : s))
			.reduce(mergeInlineCss, []);

		routes.push({
			file: '',
			links,
			scripts: [
				...scripts,
				...settings.scripts
					.filter((script) => script.stage === 'head-inline')
					.map(({ stage, content }) => ({ stage, children: content })),
			],
			styles,
			routeData: serializeRouteData(route, settings.config.trailingSlash),
		});
	}

	/**
	 * logic meant for i18n domain support, where we fill the lookup table
	 */
	const i18n = settings.config.i18n;
	if (i18n && i18n.domains) {
		for (const [locale, domainValue] of Object.entries(i18n.domains)) {
			domainLookupTable[domainValue] = normalizeTheLocale(locale);
		}
	}

	// HACK! Patch this special one.
	if (!(BEFORE_HYDRATION_SCRIPT_ID in entryModules)) {
		// Set this to an empty string so that the runtime knows not to try and load this.
		entryModules[BEFORE_HYDRATION_SCRIPT_ID] = '';
	}
	let i18nManifest: SSRManifestI18n | undefined = undefined;
	if (settings.config.i18n) {
		i18nManifest = {
			fallback: settings.config.i18n.fallback,
			fallbackType: toFallbackType(settings.config.i18n.routing),
			strategy: toRoutingStrategy(settings.config.i18n.routing, settings.config.i18n.domains),
			locales: settings.config.i18n.locales,
			defaultLocale: settings.config.i18n.defaultLocale,
			domainLookupTable,
		};
	}

	return {
		hrefRoot: opts.settings.config.root.toString(),
		cacheDir: opts.settings.config.cacheDir.toString(),
		outDir: opts.settings.config.outDir.toString(),
		srcDir: opts.settings.config.srcDir.toString(),
		publicDir: opts.settings.config.publicDir.toString(),
		buildClientDir: opts.settings.config.build.client.toString(),
		buildServerDir: opts.settings.config.build.server.toString(),
		adapterName: opts.settings.adapter?.name ?? '',
		routes,
		site: settings.config.site,
		base: settings.config.base,
		trailingSlash: settings.config.trailingSlash,
		compressHTML: settings.config.compressHTML,
		assetsPrefix: settings.config.build.assetsPrefix,
		componentMetadata: Array.from(internals.componentMetadata),
		renderers: [],
		clientDirectives: Array.from(settings.clientDirectives),
		entryModules,
		inlinedScripts: Array.from(internals.inlinedScripts),
		assets: staticFiles.map(prefixAssetPath),
		i18n: i18nManifest,
		buildFormat: settings.config.build.format,
		checkOrigin:
			(settings.config.security?.checkOrigin && settings.buildOutput === 'server') ?? false,
		serverIslandNameMap: Array.from(settings.serverIslandNameMap),
		key: encodedKey,
		sessionConfig: settings.config.experimental.session,
	};
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { teardown } from '@astrojs/compiler';
import glob from 'fast-glob';
import { bgGreen, black, green } from 'kleur/colors';
import * as vite from 'vite';
import { type BuildInternals, createBuildInternals } from '../../core/build/internal.js';
import { emptyDir, removeEmptyDirs } from '../../core/fs/index.js';
import { appendForwardSlash, prependForwardSlash } from '../../core/path.js';
import { runHookBuildSetup } from '../../integrations/hooks.js';
import { getOutputDirectory } from '../../prerender/utils.js';
import type { RouteData } from '../../types/public/internal.js';
import { PAGE_SCRIPT_ID } from '../../vite-plugin-scripts/index.js';
import { routeIsRedirect } from '../redirects/index.js';
import { getOutDirWithinCwd } from './common.js';
import { CHUNKS_PATH } from './consts.js';
import { generatePages } from './generate.js';
import { trackPageData } from './internal.js';
import { type AstroBuildPluginContainer, createPluginContainer } from './plugin.js';
import { registerAllPlugins } from './plugins/index.js';
import { RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID } from './plugins/plugin-manifest.js';
import { ASTRO_PAGE_RESOLVED_MODULE_ID } from './plugins/plugin-pages.js';
import { RESOLVED_RENDERERS_MODULE_ID } from './plugins/plugin-renderers.js';
import { RESOLVED_SSR_VIRTUAL_MODULE_ID } from './plugins/plugin-ssr.js';
import { ASTRO_PAGE_EXTENSION_POST_PATTERN } from './plugins/util.js';
import type { StaticBuildOptions } from './types.js';
import { encodeName, getTimeStat, viteBuildReturnToRollupOutputs } from './util.js';

export async function viteBuild(opts: StaticBuildOptions) {
	const { allPages, settings } = opts;

	settings.timer.start('SSR build');

	// The pages to be built for rendering purposes.
	// (comment above may be outdated ?)
	const pageInput = new Set<string>();

	// Build internals needed by the CSS plugin
	const internals = createBuildInternals();

	for (const pageData of Object.values(allPages)) {
		const astroModuleURL = new URL('./' + pageData.component, settings.config.root);
		const astroModuleId = prependForwardSlash(pageData.component);

		// Track the page data in internals
		trackPageData(internals, pageData.component, pageData, astroModuleId, astroModuleURL);

		if (!routeIsRedirect(pageData.route)) {
			pageInput.add(astroModuleId);
		}
	}

	// Empty out the dist folder, if needed. Vite has a config for doing this
	// but because we are running 2 vite builds in parallel, that would cause a race
	// condition, so we are doing it ourselves
	if (settings.config?.vite?.build?.emptyOutDir !== false) {
		emptyDir(settings.config.outDir, new Set('.git'));
	}

	// Register plugins
	const container = createPluginContainer(opts, internals);
	registerAllPlugins(container);
	// Build your project (SSR application code, assets, client JS, etc.)
	const ssrTime = performance.now();
	opts.logger.info('build', `Building ${settings.buildOutput} entrypoints...`);
	const ssrOutput = await ssrBuild(opts, internals, pageInput, container);
	opts.logger.info('build', green(`✓ Completed in ${getTimeStat(ssrTime, performance.now())}.`));

	settings.timer.end('SSR build');

	settings.timer.start('Client build');

	const rendererClientEntrypoints = settings.renderers
		.map((r) => r.clientEntrypoint)
		.filter((a) => typeof a === 'string') as string[];

	const clientInput = new Set([
		...internals.discoveredHydratedComponents.keys(),
		...internals.discoveredClientOnlyComponents.keys(),
		...rendererClientEntrypoints,
		...internals.discoveredScripts,
	]);

	if (settings.scripts.some((script) => script.stage === 'page')) {
		clientInput.add(PAGE_SCRIPT_ID);
	}

	// Run client build first, so the assets can be fed into the SSR rendered version.
	const clientOutput = await clientBuild(opts, internals, clientInput, container);

	const ssrOutputs = viteBuildReturnToRollupOutputs(ssrOutput);
	const clientOutputs = viteBuildReturnToRollupOutputs(clientOutput ?? []);
	await runPostBuildHooks(container, ssrOutputs, clientOutputs);
	settings.timer.end('Client build');

	// Free up memory
	internals.ssrEntryChunk = undefined;
	if (opts.teardownCompiler) {
		teardown();
	}

	// For static builds, the SSR output won't be needed anymore after page generation.
	// We keep track of the names here so we only remove these specific files when finished.
	const ssrOutputChunkNames: string[] = [];
	for (const output of ssrOutputs) {
		for (const chunk of output.output) {
			if (chunk.type === 'chunk') {
				ssrOutputChunkNames.push(chunk.fileName);
			}
		}
	}

	return { internals, ssrOutputChunkNames };
}

export async function staticBuild(
	opts: StaticBuildOptions,
	internals: BuildInternals,
	ssrOutputChunkNames: string[],
) {
	const { settings } = opts;
	if (settings.buildOutput === 'static') {
		settings.timer.start('Static generate');
		await generatePages(opts, internals);
		await cleanServerOutput(opts, ssrOutputChunkNames, internals);
		settings.timer.end('Static generate');
	} else if (settings.buildOutput === 'server') {
		settings.timer.start('Server generate');
		await generatePages(opts, internals);
		await cleanStaticOutput(opts, internals);
		await ssrMoveAssets(opts);
		settings.timer.end('Server generate');
	}
}

async function ssrBuild(
	opts: StaticBuildOptions,
	internals: BuildInternals,
	input: Set<string>,
	container: AstroBuildPluginContainer,
) {
	const { allPages, settings, viteConfig } = opts;
	const ssr = settings.buildOutput === 'server';
	const out = getOutputDirectory(settings);
	const routes = Object.values(allPages).flatMap((pageData) => pageData.route);
	const { lastVitePlugins, vitePlugins } = await container.runBeforeHook('server', input);
	const viteBuildConfig: vite.InlineConfig = {
		...viteConfig,
		logLevel: viteConfig.logLevel ?? 'error',
		build: {
			target: 'esnext',
			// Vite defaults cssMinify to false in SSR by default, but we want to minify it
			// as the CSS generated are used and served to the client.
			cssMinify: viteConfig.build?.minify == null ? true : !!viteConfig.build?.minify,
			...viteConfig.build,
			emptyOutDir: false,
			manifest: false,
			outDir: fileURLToPath(out),
			copyPublicDir: !ssr,
			rollupOptions: {
				...viteConfig.build?.rollupOptions,
				// Setting as `exports-only` allows us to safely delete inputs that are only used during prerendering
				preserveEntrySignatures: 'exports-only',
				input: [],
				output: {
					hoistTransitiveImports: false,
					format: 'esm',
					minifyInternalExports: true,
					// Server chunks can't go in the assets (_astro) folder
					// We need to keep these separate
					chunkFileNames(chunkInfo) {
						const { name } = chunkInfo;
						let prefix = CHUNKS_PATH;
						let suffix = '_[hash].mjs';

						// Sometimes chunks have the `@_@astro` suffix due to SSR logic. Remove it!
						// TODO: refactor our build logic to avoid this
						if (name.includes(ASTRO_PAGE_EXTENSION_POST_PATTERN)) {
							const [sanitizedName] = name.split(ASTRO_PAGE_EXTENSION_POST_PATTERN);
							return [prefix, sanitizedName, suffix].join('');
						}
						// Injected routes include "pages/[name].[ext]" already. Clean those up!
						if (name.startsWith('pages/')) {
							const sanitizedName = name.split('.')[0];
							return [prefix, sanitizedName, suffix].join('');
						}
						const encoded = encodeName(name);
						return [prefix, encoded, suffix].join('');
					},
					assetFileNames: `${settings.config.build.assets}/[name].[hash][extname]`,
					...viteConfig.build?.rollupOptions?.output,
					entryFileNames(chunkInfo) {
						if (chunkInfo.facadeModuleId?.startsWith(ASTRO_PAGE_RESOLVED_MODULE_ID)) {
							return makeAstroPageEntryPointFileName(
								ASTRO_PAGE_RESOLVED_MODULE_ID,
								chunkInfo.facadeModuleId,
								routes,
							);
						} else if (chunkInfo.facadeModuleId === RESOLVED_SSR_VIRTUAL_MODULE_ID) {
							return opts.settings.config.build.serverEntry;
						} else if (chunkInfo.facadeModuleId === RESOLVED_RENDERERS_MODULE_ID) {
							return 'renderers.mjs';
						} else if (chunkInfo.facadeModuleId === RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID) {
							return 'manifest_[hash].mjs';
						} else if (chunkInfo.facadeModuleId === settings.adapter?.serverEntrypoint) {
							return 'adapter_[hash].mjs';
						} else {
							return '[name].mjs';
						}
					},
				},
			},
			ssr: true,
			ssrEmitAssets: true,
			// improve build performance
			minify: false,
			modulePreload: { polyfill: false },
			reportCompressedSize: false,
		},
		plugins: [...vitePlugins, ...(viteConfig.plugins || []), ...lastVitePlugins],
		envPrefix: viteConfig.envPrefix ?? 'PUBLIC_',
		base: settings.config.base,
	};

	const updatedViteBuildConfig = await runHookBuildSetup({
		config: settings.config,
		pages: internals.pagesByKeys,
		vite: viteBuildConfig,
		target: 'server',
		logger: opts.logger,
	});

	return await vite.build(updatedViteBuildConfig);
}

async function clientBuild(
	opts: StaticBuildOptions,
	internals: BuildInternals,
	input: Set<string>,
	container: AstroBuildPluginContainer,
) {
	const { settings, viteConfig } = opts;
	const ssr = settings.buildOutput === 'server';
	const out = ssr ? settings.config.build.client : getOutDirWithinCwd(settings.config.outDir);

	// Nothing to do if there is no client-side JS.
	if (!input.size) {
		// If SSR, copy public over
		if (ssr) {
			await copyFiles(settings.config.publicDir, out, true);
		}

		return null;
	}

	const { lastVitePlugins, vitePlugins } = await container.runBeforeHook('client', input);
	opts.logger.info('SKIP_FORMAT', `\n${bgGreen(black(' building client (vite) '))}`);

	const viteBuildConfig: vite.InlineConfig = {
		...viteConfig,
		build: {
			target: 'esnext',
			...viteConfig.build,
			emptyOutDir: false,
			outDir: fileURLToPath(out),
			copyPublicDir: ssr,
			rollupOptions: {
				...viteConfig.build?.rollupOptions,
				input: Array.from(input),
				output: {
					format: 'esm',
					entryFileNames: `${settings.config.build.assets}/[name].[hash].js`,
					chunkFileNames: `${settings.config.build.assets}/[name].[hash].js`,
					assetFileNames: `${settings.config.build.assets}/[name].[hash][extname]`,
					...viteConfig.build?.rollupOptions?.output,
				},
				preserveEntrySignatures: 'exports-only',
			},
		},
		plugins: [...vitePlugins, ...(viteConfig.plugins || []), ...lastVitePlugins],
		envPrefix: viteConfig.envPrefix ?? 'PUBLIC_',
		base: settings.config.base,
	};

	const updatedViteBuildConfig = await runHookBuildSetup({
		config: settings.config,
		pages: internals.pagesByKeys,
		vite: viteBuildConfig,
		target: 'client',
		logger: opts.logger,
	});

	const buildResult = await vite.build(updatedViteBuildConfig);
	return buildResult;
}

async function runPostBuildHooks(
	container: AstroBuildPluginContainer,
	ssrOutputs: vite.Rollup.RollupOutput[],
	clientOutputs: vite.Rollup.RollupOutput[],
) {
	const mutations = await container.runPostHook(ssrOutputs, clientOutputs);
	const config = container.options.settings.config;
	const build = container.options.settings.config.build;
	for (const [fileName, mutation] of mutations) {
		const root =
			container.options.settings.buildOutput === 'server'
				? mutation.targets.includes('server')
					? build.server
					: build.client
				: getOutDirWithinCwd(config.outDir);
		const fullPath = path.join(fileURLToPath(root), fileName);
		const fileURL = pathToFileURL(fullPath);
		await fs.promises.mkdir(new URL('./', fileURL), { recursive: true });
		await fs.promises.writeFile(fileURL, mutation.code, 'utf-8');
	}
}

/**
 * Remove chunks that are used for prerendering only
 */
async function cleanStaticOutput(opts: StaticBuildOptions, internals: BuildInternals) {
	const ssr = opts.settings.buildOutput === 'server';
	const out = ssr
		? opts.settings.config.build.server
		: getOutDirWithinCwd(opts.settings.config.outDir);
	await Promise.all(
		internals.prerenderOnlyChunks.map(async (chunk) => {
			const url = new URL(chunk.fileName, out);
			try {
				// Entry chunks may be referenced by non-deleted code, so we don't actually delete it
				// but only empty its content. These chunks should never be executed in practice, but
				// it should prevent broken import paths if adapters do a secondary bundle.
				if (chunk.isEntry || chunk.isDynamicEntry) {
					await fs.promises.writeFile(
						url,
						"// Contents removed by Astro as it's used for prerendering only",
						'utf-8',
					);
				} else {
					await fs.promises.unlink(url);
				}
			} catch {
				// Best-effort only. Sometimes some chunks may be deleted by other plugins, like pure CSS chunks,
				// so they may already not exist.
			}
		}),
	);
}

async function cleanServerOutput(
	opts: StaticBuildOptions,
	ssrOutputChunkNames: string[],
	internals: BuildInternals,
) {
	const out = getOutDirWithinCwd(opts.settings.config.outDir);
	// The SSR output chunks for Astro are all .mjs files
	const files = ssrOutputChunkNames.filter((f) => f.endsWith('.mjs'));
	if (internals.manifestFileName) {
		files.push(internals.manifestFileName);
	}
	if (files.length) {
		// Remove all the SSR generated .mjs files
		await Promise.all(
			files.map(async (filename) => {
				const url = new URL(filename, out);
				const map = new URL(url + '.map');
				// Sourcemaps may not be generated, so ignore any errors if fail to remove it
				await Promise.all([fs.promises.rm(url), fs.promises.rm(map).catch(() => {})]);
			}),
		);

		removeEmptyDirs(fileURLToPath(out));
	}

	// Clean out directly if the outDir is outside of root
	if (out.toString() !== opts.settings.config.outDir.toString()) {
		// Remove .d.ts files
		const fileNames = await fs.promises.readdir(out);
		await Promise.all(
			fileNames
				.filter((fileName) => fileName.endsWith('.d.ts'))
				.map((fileName) => fs.promises.rm(new URL(fileName, out))),
		);
		// Copy assets before cleaning directory if outside root
		await copyFiles(out, opts.settings.config.outDir, true);
		await fs.promises.rm(out, { recursive: true });
		return;
	}
}

export async function copyFiles(fromFolder: URL, toFolder: URL, includeDotfiles = false) {
	const files = await glob('**/*', {
		cwd: fileURLToPath(fromFolder),
		dot: includeDotfiles,
	});
	if (files.length === 0) return;
	return await Promise.all(
		files.map(async function copyFile(filename) {
			const from = new URL(filename, fromFolder);
			const to = new URL(filename, toFolder);
			const lastFolder = new URL('./', to);
			return fs.promises.mkdir(lastFolder, { recursive: true }).then(async function fsCopyFile() {
				const p = await fs.promises.copyFile(from, to, fs.constants.COPYFILE_FICLONE);
				return p;
			});
		}),
	);
}

async function ssrMoveAssets(opts: StaticBuildOptions) {
	opts.logger.info('build', 'Rearranging server assets...');
	const serverRoot =
		opts.settings.buildOutput === 'static'
			? opts.settings.config.build.client
			: opts.settings.config.build.server;
	const clientRoot = opts.settings.config.build.client;
	const assets = opts.settings.config.build.assets;
	const serverAssets = new URL(`./${assets}/`, appendForwardSlash(serverRoot.toString()));
	const clientAssets = new URL(`./${assets}/`, appendForwardSlash(clientRoot.toString()));
	const files = await glob(`**/*`, {
		cwd: fileURLToPath(serverAssets),
	});

	if (files.length > 0) {
		await Promise.all(
			files.map(async function moveAsset(filename) {
				const currentUrl = new URL(filename, appendForwardSlash(serverAssets.toString()));
				const clientUrl = new URL(filename, appendForwardSlash(clientAssets.toString()));
				const dir = new URL(path.parse(clientUrl.href).dir);
				// It can't find this file because the user defines a custom path
				// that includes the folder paths in `assetFileNames
				if (!fs.existsSync(dir)) await fs.promises.mkdir(dir, { recursive: true });
				return fs.promises.rename(currentUrl, clientUrl);
			}),
		);
		removeEmptyDirs(fileURLToPath(serverRoot));
	}
}

/**
 * This function takes the virtual module name of any page entrypoint and
 * transforms it to generate a final `.mjs` output file.
 *
 * Input: `@astro-page:src/pages/index@_@astro`
 * Output: `pages/index.astro.mjs`
 * Input: `@astro-page:../node_modules/my-dep/injected@_@astro`
 * Output: `pages/injected.mjs`
 *
 * 1. We clean the `facadeModuleId` by removing the `ASTRO_PAGE_MODULE_ID` prefix and `ASTRO_PAGE_EXTENSION_POST_PATTERN`.
 * 2. We find the matching route pattern in the manifest (or fallback to the cleaned module id)
 * 3. We replace square brackets with underscore (`[slug]` => `_slug_`) and `...` with `` (`[...slug]` => `_---slug_`).
 * 4. We append the `.mjs` extension, so the file will always be an ESM module
 *
 * @param prefix string
 * @param facadeModuleId string
 * @param pages AllPagesData
 */
export function makeAstroPageEntryPointFileName(
	prefix: string,
	facadeModuleId: string,
	routes: RouteData[],
) {
	const pageModuleId = facadeModuleId
		.replace(prefix, '')
		.replace(ASTRO_PAGE_EXTENSION_POST_PATTERN, '.');
	const route = routes.find((routeData) => routeData.component === pageModuleId);
	const name = route?.route ?? pageModuleId;
	return `pages${name
		.replace(/\/$/, '/index')
		.replaceAll(/[[\]]/g, '_')
		.replaceAll('...', '---')}.astro.mjs`;
}

import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { bold } from 'kleur/colors';
import MagicString from 'magic-string';
import { fileURLToPath } from 'node:url';
import type * as vite from 'vite';
import { normalizePath } from 'vite';
import type { AstroPluginOptions, ImageTransform } from '../@types/astro';
import { info, error } from '../core/logger/core.js';
import {
	appendForwardSlash,
	joinPaths,
	prependForwardSlash,
	removeQueryString,
} from '../core/path.js';
import { VIRTUAL_MODULE_ID, VIRTUAL_SERVICE_ID } from './consts.js';
import { isRemoteAllowed, isRemoteImage } from './internal.js';
import { emitESMImage } from './utils/emitAsset.js';
import { hashTransform, propsToFilename } from './utils/transformToPath.js';

const resolvedVirtualModuleId = '\0' + VIRTUAL_MODULE_ID;

const rawRE = /(?:\?|&)raw(?:&|$)/;
const urlRE = /(\?|&)url(?:&|$)/;

export default function assets({
	settings,
	logging,
	mode,
}: AstroPluginOptions & { mode: string }): vite.Plugin[] {
	let resolvedConfig: vite.ResolvedConfig;

	globalThis.astroAsset = {};

	const UNSUPPORTED_ADAPTERS = new Set([
		'@astrojs/cloudflare',
		'@astrojs/deno',
		'@astrojs/netlify/edge-functions',
		'@astrojs/vercel/edge',
	]);

	const adapterName = settings.config.adapter?.name;
	if (
		['astro/assets/services/sharp', 'astro/assets/services/squoosh'].includes(
			settings.config.image.service.entrypoint
		) &&
		adapterName &&
		UNSUPPORTED_ADAPTERS.has(adapterName)
	) {
		error(
			logging,
			'assets',
			`The currently selected adapter \`${adapterName}\` does not run on Node, however the currently used image service depends on Node built-ins. ${bold(
				'Your project will NOT be able to build.'
			)}`
		);
	}

	return [
		// Expose the components and different utilities from `astro:assets` and handle serving images from `/_image` in dev
		{
			name: 'astro:assets',
			config() {
				return {
					resolve: {
						alias: [
							{
								find: /^~\/assets\/(.+)$/,
								replacement: fileURLToPath(new URL('./assets/$1', settings.config.srcDir)),
							},
						],
					},
				};
			},
			async resolveId(id) {
				if (id === VIRTUAL_SERVICE_ID) {
					return await this.resolve(settings.config.image.service.entrypoint);
				}
				if (id === VIRTUAL_MODULE_ID) {
					return resolvedVirtualModuleId;
				}
			},
			load(id) {
				if (id === resolvedVirtualModuleId) {
					return `
					export { getConfiguredImageService, isLocalService } from "astro/assets";
					import { getImage as getImageInternal } from "astro/assets";
					export { default as Image } from "astro/components/Image.astro";

					export const imageServiceConfig = ${JSON.stringify(settings.config.image.service.config)};
					export const astroAssetsConfig = ${JSON.stringify(settings.config.image)};
					export const getImage = async (options) => await getImageInternal(options, imageServiceConfig, astroAssetsConfig);
				`;
				}
			},
			buildStart() {
				if (mode != 'build') {
					return;
				}

				globalThis.astroAsset.addStaticImage = async (options) => {
					if (!globalThis.astroAsset.staticImages) {
						globalThis.astroAsset.staticImages = new Map<
							string,
							{ path: string; options: ImageTransform }
						>();
					}

					// hard skip on non allowed remote images
					if (
						typeof options.src === 'string' &&
						!isRemoteAllowed(options.src, settings.config.image)
					) {
						return options.src;
					}

					// in case of remote images
					if (isRemoteImage(options.src)) {
						const remoteCacheDir = new URL('remote-assets/', settings.config.cacheDir);
						await mkdir(remoteCacheDir, { recursive: true });

						const remoteFileURL = new URL(options.src);
						const cachedFileURL = new URL('.' + remoteFileURL.pathname, remoteCacheDir);

						// there's no async api for exists :(
						if (!existsSync(cachedFileURL)) {
							info(
								logging,
								'astro:assets',
								`${bold('downloading remote asset')} ${remoteFileURL.href} -> ${cachedFileURL.href}`
							);
							const res = await fetch(remoteFileURL);
							const imgBytes = await res.arrayBuffer();
							await writeFile(cachedFileURL, Buffer.from(imgBytes));
						}
					}

					const hash = hashTransform(options, settings.config.image.service.entrypoint);

					let filePath: string;
					const hasHash = globalThis.astroAsset.staticImages.has(hash);
					if (hasHash) {
						filePath = globalThis.astroAsset.staticImages.get(hash)!.path;
					} else if (isRemoteImage(options.src)) {
						const { pathname } = new URL(options.src);
						filePath = options.format
							? pathname.slice(0, pathname.lastIndexOf('.') + 1) + options.format
							: pathname;
					} else {
						filePath = propsToFilename(options, hash);
					}

					if (!hasHash) {
						filePath = prependForwardSlash(joinPaths(settings.config.build.assets, filePath));
						globalThis.astroAsset.staticImages.set(hash, { path: filePath, options: options });
					}

					if (isRemoteImage(options.src)) {
						return filePath;
					} else if (settings.config.build.assetsPrefix) {
						return joinPaths(settings.config.build.assetsPrefix, filePath);
					} else {
						return prependForwardSlash(joinPaths(settings.config.base, filePath));
					}
				};
			},
			// In build, rewrite paths to ESM imported images in code to their final location
			async renderChunk(code) {
				const assetUrlRE = /__ASTRO_ASSET_IMAGE__([a-z\d]{8})__(?:_(.*?)__)?/g;

				let match;
				let s;
				while ((match = assetUrlRE.exec(code))) {
					s = s || (s = new MagicString(code));
					const [full, hash, postfix = ''] = match;

					const file = this.getFileName(hash);
					const prefix = settings.config.build.assetsPrefix
						? appendForwardSlash(settings.config.build.assetsPrefix)
						: resolvedConfig.base;
					const outputFilepath = prefix + normalizePath(file + postfix);

					s.overwrite(match.index, match.index + full.length, outputFilepath);
				}

				if (s) {
					return {
						code: s.toString(),
						map: resolvedConfig.build.sourcemap ? s.generateMap({ hires: 'boundary' }) : null,
					};
				} else {
					return null;
				}
			},
		},
		// Return a more advanced shape for images imported in ESM
		{
			name: 'astro:assets:esm',
			enforce: 'pre',
			configResolved(viteConfig) {
				resolvedConfig = viteConfig;
			},
			async load(id) {
				// If our import has the `?raw` or `?url` Vite query params, we'll let Vite handle it
				if (rawRE.test(id) || urlRE.test(id)) {
					return;
				}

				const cleanedUrl = removeQueryString(id);
				if (/\.(jpeg|jpg|png|tiff|webp|gif|svg)$/.test(cleanedUrl)) {
					const meta = await emitESMImage(id, this.meta.watchMode, this.emitFile);
					return `export default ${JSON.stringify(meta)}`;
				}
			},
		},
	];
}

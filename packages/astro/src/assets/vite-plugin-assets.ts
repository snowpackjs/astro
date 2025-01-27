import { extname } from 'node:path';
import MagicString from 'magic-string';
import type * as vite from 'vite';
import { AstroError, AstroErrorData } from '../core/errors/index.js';
import {
	appendForwardSlash,
	joinPaths,
	prependForwardSlash,
	removeBase,
	removeQueryString,
} from '../core/path.js';
import { normalizePath } from '../core/viteUtils.js';
import type { AstroSettings } from '../types/astro.js';
import { VALID_INPUT_FORMATS, VIRTUAL_MODULE_ID, VIRTUAL_SERVICE_ID } from './consts.js';
import type { ImageTransform } from './types.js';
import { getAssetsPrefix } from './utils/getAssetsPrefix.js';
import { isESMImportedImage } from './utils/imageKind.js';
import { emitESMImage } from './utils/node/emitAsset.js';
import { getProxyCode } from './utils/proxy.js';
import { makeSvgComponent } from './utils/svg.js';
import { hashTransform, propsToFilename } from './utils/transformToPath.js';

const resolvedVirtualModuleId = '\0' + VIRTUAL_MODULE_ID;

const assetRegex = new RegExp(`\\.(${VALID_INPUT_FORMATS.join('|')})`, 'i');
const assetRegexEnds = new RegExp(`\\.(${VALID_INPUT_FORMATS.join('|')})$`, 'i');
const addStaticImageFactory = (
	settings: AstroSettings,
): typeof globalThis.astroAsset.addStaticImage => {
	return (options, hashProperties, originalFSPath) => {
		if (!globalThis.astroAsset.staticImages) {
			globalThis.astroAsset.staticImages = new Map<
				string,
				{
					originalSrcPath: string;
					transforms: Map<string, { finalPath: string; transform: ImageTransform }>;
				}
			>();
		}

		// Rollup will copy the file to the output directory, as such this is the path in the output directory, including the asset prefix / base
		const ESMImportedImageSrc = isESMImportedImage(options.src) ? options.src.src : options.src;
		const fileExtension = extname(ESMImportedImageSrc);
		const assetPrefix = getAssetsPrefix(fileExtension, settings.config.build.assetsPrefix);

		// This is the path to the original image, from the dist root, without the base or the asset prefix (e.g. /_astro/image.hash.png)
		const finalOriginalPath = removeBase(
			removeBase(ESMImportedImageSrc, settings.config.base),
			assetPrefix,
		);

		const hash = hashTransform(options, settings.config.image.service.entrypoint, hashProperties);

		let finalFilePath: string;
		let transformsForPath = globalThis.astroAsset.staticImages.get(finalOriginalPath);
		const transformForHash = transformsForPath?.transforms.get(hash);

		// If the same image has already been transformed with the same options, we'll reuse the final path
		if (transformsForPath && transformForHash) {
			finalFilePath = transformForHash.finalPath;
		} else {
			finalFilePath = prependForwardSlash(
				joinPaths(
					isESMImportedImage(options.src) ? '' : settings.config.build.assets,
					prependForwardSlash(propsToFilename(finalOriginalPath, options, hash)),
				),
			);

			if (!transformsForPath) {
				globalThis.astroAsset.staticImages.set(finalOriginalPath, {
					originalSrcPath: originalFSPath,
					transforms: new Map(),
				});
				transformsForPath = globalThis.astroAsset.staticImages.get(finalOriginalPath)!;
			}

			transformsForPath.transforms.set(hash, {
				finalPath: finalFilePath,
				transform: options,
			});
		}

		// The paths here are used for URLs, so we need to make sure they have the proper format for an URL
		// (leading slash, prefixed with the base / assets prefix, encoded, etc)
		if (settings.config.build.assetsPrefix) {
			return encodeURI(joinPaths(assetPrefix, finalFilePath));
		} else {
			return encodeURI(prependForwardSlash(joinPaths(settings.config.base, finalFilePath)));
		}
	};
};

export default function assets({ settings }: { settings: AstroSettings }): vite.Plugin[] {
	let resolvedConfig: vite.ResolvedConfig;
	let shouldEmitFile = false;
	let isBuild = false;

	globalThis.astroAsset = {
		referencedImages: new Set(),
	};

	const imageComponentPrefix = settings.config.experimental.responsiveImages ? 'Responsive' : '';
	return [
		// Expose the components and different utilities from `astro:assets`
		{
			name: 'astro:assets',
			config(_, env) {
				isBuild = env.command === 'build';
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
					return /* ts */ `
					export { getConfiguredImageService, isLocalService } from "astro/assets";
					import { getImage as getImageInternal } from "astro/assets";
					export { default as Image } from "astro/components/${imageComponentPrefix}Image.astro";
					export { default as Picture } from "astro/components/${imageComponentPrefix}Picture.astro";
					export { inferRemoteSize } from "astro/assets/utils/inferRemoteSize.js";

					export const imageConfig = ${JSON.stringify({ ...settings.config.image, experimentalResponsiveImages: settings.config.experimental.responsiveImages })};
					// This is used by the @astrojs/node integration to locate images.
					// It's unused on other platforms, but on some platforms like Netlify (and presumably also Vercel)
					// new URL("dist/...") is interpreted by the bundler as a signal to include that directory
					// in the Lambda bundle, which would bloat the bundle with images.
					// To prevent this, we mark the URL construction as pure,
					// so that it's tree-shaken away for all platforms that don't need it.
					export const outDir = /* #__PURE__ */ new URL(${JSON.stringify(
						new URL(
							settings.buildOutput === 'server'
								? settings.config.build.client
								: settings.config.outDir,
						),
					)});
					export const assetsDir = /* #__PURE__ */ new URL(${JSON.stringify(
						settings.config.build.assets,
					)}, outDir);
					export const getImage = async (options) => await getImageInternal(options, imageConfig);
				`;
				}
			},
			buildStart() {
				if (!isBuild) return;
				globalThis.astroAsset.addStaticImage = addStaticImageFactory(settings);
			},
			// In build, rewrite paths to ESM imported images in code to their final location
			async renderChunk(code) {
				const assetUrlRE = /__ASTRO_ASSET_IMAGE__([\w$]{8})__(?:_(.*?)__)?/g;

				let match;
				let s;
				while ((match = assetUrlRE.exec(code))) {
					s = s || (s = new MagicString(code));
					const [full, hash, postfix = ''] = match;

					const file = this.getFileName(hash);
					const fileExtension = extname(file);
					const pf = getAssetsPrefix(fileExtension, settings.config.build.assetsPrefix);
					const prefix = pf ? appendForwardSlash(pf) : resolvedConfig.base;
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
			config(_, env) {
				shouldEmitFile = env.command === 'build';
			},
			configResolved(viteConfig) {
				resolvedConfig = viteConfig;
			},
			async load(id, options) {
				if (assetRegex.test(id)) {
					if (!globalThis.astroAsset.referencedImages)
						globalThis.astroAsset.referencedImages = new Set();

					if (id !== removeQueryString(id)) {
						// If our import has any query params, we'll let Vite handle it, nonetheless we'll make sure to not delete it
						// See https://github.com/withastro/astro/issues/8333
						globalThis.astroAsset.referencedImages.add(removeQueryString(id));
						return;
					}

					// If the requested ID doesn't end with a valid image extension, we'll let Vite handle it
					if (!assetRegexEnds.test(id)) {
						return;
					}

					const emitFile = shouldEmitFile ? this.emitFile : undefined;
					const imageMetadata = await emitESMImage(
						id,
						this.meta.watchMode,
						!!settings.config.experimental.svg,
						emitFile,
					);

					if (!imageMetadata) {
						throw new AstroError({
							...AstroErrorData.ImageNotFound,
							message: AstroErrorData.ImageNotFound.message(id),
						});
					}

					if (settings.config.experimental.svg && /\.svg$/.test(id)) {
						const { contents, ...metadata } = imageMetadata;
						// We know that the contents are present, as we only emit this property for SVG files
						return makeSvgComponent(metadata, contents!, {
							mode: settings.config.experimental.svg.mode,
						});
					}

					// We can only reliably determine if an image is used on the server, as we need to track its usage throughout the entire build.
					// Since you cannot use image optimization on the client anyway, it's safe to assume that if the user imported
					// an image on the client, it should be present in the final build.
					if (options?.ssr) {
						return `export default ${getProxyCode(
							imageMetadata,
							settings.buildOutput === 'server',
						)}`;
					} else {
						globalThis.astroAsset.referencedImages.add(imageMetadata.fsPath);
						return `export default ${JSON.stringify(imageMetadata)}`;
					}
				}
			},
		},
	];
}

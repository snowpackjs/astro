import type { PluginContext } from 'rollup';
import { z } from 'zod';
import type { ImageMetadata, OmitBrand } from '../assets/types.js';
import { emitESMImage } from '../assets/utils/node/emitAsset.js';

export function createImage(
	pluginContext: PluginContext,
	shouldEmitFile: boolean,
	entryFilePath: string,
	experimentalSvgEnabled: boolean,
) {
	return () => {
		return z.string().transform(async (imagePath, ctx) => {
			const resolvedFilePath = (await pluginContext.resolve(imagePath, entryFilePath))?.id;
			const metadata = (await emitESMImage(
				resolvedFilePath,
				pluginContext.meta.watchMode,
				experimentalSvgEnabled,
				shouldEmitFile ? pluginContext.emitFile : undefined,
			)) as OmitBrand<ImageMetadata>;

			if (!metadata) {
				ctx.addIssue({
					code: 'custom',
					message: `Image ${imagePath} does not exist. Is the path correct?`,
					fatal: true,
				});

				return z.never();
			}

			return { ...metadata, ASTRO_ASSET: metadata.fsPath };
		});
	};
}

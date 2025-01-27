import { isRemotePath, removeBase } from '@astrojs/internal-helpers/path';
import { CONTENT_IMAGE_FLAG, IMAGE_IMPORT_PREFIX } from '../../content/consts.js';
import { shorthash } from '../../runtime/server/shorthash.js';
import { VALID_INPUT_FORMATS } from '../consts.js';

/**
 * Resolves an image src from a content file (such as markdown) to a module ID or import that can be resolved by Vite.
 *
 * @param imageSrc The src attribute of an image tag
 * @param filePath The path to the file that contains the imagem relative to the site root
 * @returns A module id of the image that can be rsolved by Vite, or undefined if it is not a local image
 */
export function imageSrcToImportId(imageSrc: string, filePath?: string): string | undefined {
	// If the import is coming from the data store it will have a special prefix to identify it
	// as an image import. We remove this prefix so that we can resolve the image correctly.
	imageSrc = removeBase(imageSrc, IMAGE_IMPORT_PREFIX);

	// We only care about local imports
	if (isRemotePath(imageSrc)) {
		return;
	}
	// We only care about images
	const ext = imageSrc.split('.').at(-1)?.toLowerCase() as
		| (typeof VALID_INPUT_FORMATS)[number]
		| undefined;
	if (!ext || !VALID_INPUT_FORMATS.includes(ext)) {
		return;
	}

	// The import paths are relative to the content (md) file, but when it's actually resolved it will
	// be in a single assets file, so relative paths will no longer work. To deal with this we use
	// a query parameter to store the original path to the file and append a query param flag.
	// This allows our Vite plugin to intercept the import and resolve the path relative to the
	// importer and get the correct full path for the imported image.

	const params = new URLSearchParams(CONTENT_IMAGE_FLAG);
	if (filePath) {
		params.set('importer', filePath);
	}
	return `${imageSrc}?${params.toString()}`;
}

export const importIdToSymbolName = (importId: string) =>
	`__ASTRO_IMAGE_IMPORT_${shorthash(importId)}`;

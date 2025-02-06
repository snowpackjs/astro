import { extname } from 'node:path';
import type { BuildOptions, Rollup, Plugin as VitePlugin } from 'vite';
import type { BuildInternals } from '../internal.js';
import type { PageBuildData } from '../types.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type OutputOptionsHook = Extract<VitePlugin['outputOptions'], Function>;
type OutputOptions = Parameters<OutputOptionsHook>[0];

type ExtendManualChunksHooks = {
	before?: Rollup.GetManualChunk;
	after?: Rollup.GetManualChunk;
};

export function extendManualChunks(outputOptions: OutputOptions, hooks: ExtendManualChunksHooks) {
	const manualChunks = outputOptions.manualChunks;
	outputOptions.manualChunks = function (id, meta) {
		if (hooks.before) {
			let value = hooks.before(id, meta);
			if (value) {
				return value;
			}
		}

		// Defer to user-provided `manualChunks`, if it was provided.
		if (typeof manualChunks == 'object') {
			if (id in manualChunks) {
				let value = manualChunks[id];
				return value[0];
			}
		} else if (typeof manualChunks === 'function') {
			const outid = manualChunks.call(this, id, meta);
			if (outid) {
				return outid;
			}
		}

		if (hooks.after) {
			return hooks.after(id, meta) || null;
		}
		return null;
	};
}

// This is an arbitrary string that we use to replace the dot of the extension.
export const ASTRO_PAGE_EXTENSION_POST_PATTERN = '@_@';
// This is an arbitrary string that we use to make a pageData key
// Has to be a invalid character for a route, to avoid conflicts.
export const ASTRO_PAGE_KEY_SEPARATOR = '&';

/**
 * Generate a unique key to identify each page in the build process.
 * @param route Usually pageData.route.route
 * @param componentPath Usually pageData.component
 */
export function makePageDataKey(route: string, componentPath: string): string {
	return route + ASTRO_PAGE_KEY_SEPARATOR + componentPath;
}

/**
 * Prevents Rollup from triggering other plugins in the process by masking the extension (hence the virtual file).
 * Inverse function of getComponentFromVirtualModulePageName() below.
 * @param virtualModulePrefix The prefix used to create the virtual module
 * @param path Page component path
 */
export function getVirtualModulePageName(virtualModulePrefix: string, path: string): string {
	const extension = extname(path);
	return (
		virtualModulePrefix +
		(extension.startsWith('.')
			? path.slice(0, -extension.length) + extension.replace('.', ASTRO_PAGE_EXTENSION_POST_PATTERN)
			: path)
	);
}

/**
 * From the VirtualModulePageName, and the internals, get all pageDatas that use this
 * component as their entry point.
 * @param virtualModulePrefix The prefix used to create the virtual module
 * @param id Virtual module name
 */
export function getPagesFromVirtualModulePageName(
	internals: BuildInternals,
	virtualModulePrefix: string,
	id: string,
): PageBuildData[] {
	const path = getComponentFromVirtualModulePageName(virtualModulePrefix, id);

	const pages: PageBuildData[] = [];
	internals.pagesByKeys.forEach((pageData) => {
		if (pageData.component === path) {
			pages.push(pageData);
		}
	});

	return pages;
}

/**
 * From the VirtualModulePageName, get the component path.
 * Remember that the component can be use by multiple routes.
 * Inverse function of getVirtualModulePageName() above.
 * @param virtualModulePrefix The prefix at the beginning of the virtual module
 * @param id Virtual module name
 */
export function getComponentFromVirtualModulePageName(
	virtualModulePrefix: string,
	id: string,
): string {
	return id.slice(virtualModulePrefix.length).replace(ASTRO_PAGE_EXTENSION_POST_PATTERN, '.');
}

export function shouldInlineAsset(
	assetContent: string,
	assetPath: string,
	assetsInlineLimit: NonNullable<BuildOptions['assetsInlineLimit']>,
) {
	if (typeof assetsInlineLimit === 'function') {
		const result = assetsInlineLimit(assetPath, Buffer.from(assetContent));
		if (result != null) {
			return result;
		} else {
			return Buffer.byteLength(assetContent) < 4096; // Fallback to 4096kb by default (same as Vite)
		}
	}
	return Buffer.byteLength(assetContent) < Number(assetsInlineLimit);
}

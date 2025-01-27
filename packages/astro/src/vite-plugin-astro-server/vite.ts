import npath from 'node:path';
import { SUPPORTED_MARKDOWN_FILE_EXTENSIONS } from '../core/constants.js';
import type { ModuleLoader, ModuleNode } from '../core/module-loader/index.js';
import { unwrapId } from '../core/util.js';
import { hasSpecialQueries } from '../vite-plugin-utils/index.js';
import { isCSSRequest } from './util.js';

/**
 * List of file extensions signalling we can (and should) SSR ahead-of-time
 * See usage below
 */
const fileExtensionsToSSR = new Set(['.astro', '.mdoc', ...SUPPORTED_MARKDOWN_FILE_EXTENSIONS]);

const STRIP_QUERY_PARAMS_REGEX = /\?.*$/;

/** recursively crawl the module graph to get all style files imported by parent id */
export async function* crawlGraph(
	loader: ModuleLoader,
	_id: string,
	isRootFile: boolean,
	scanned = new Set<string>(),
): AsyncGenerator<ModuleNode, void, unknown> {
	const id = unwrapId(_id);
	const importedModules = new Set<ModuleNode>();

	const moduleEntriesForId = isRootFile
		? // "getModulesByFile" pulls from a delayed module cache (fun implementation detail),
			// So we can get up-to-date info on initial server load.
			// Needed for slower CSS preprocessing like Tailwind
			(loader.getModulesByFile(id) ?? new Set())
		: // For non-root files, we're safe to pull from "getModuleById" based on testing.
			// TODO: Find better invalidation strategy to use "getModuleById" in all cases!
			new Set([loader.getModuleById(id)]);

	// Collect all imported modules for the module(s).
	for (const entry of moduleEntriesForId) {
		// Handle this in case an module entries weren't found for ID
		// This seems possible with some virtual IDs (ex: `astro:markdown/*.md`)
		if (!entry) {
			continue;
		}
		if (id === entry.id) {
			scanned.add(id);

			// NOTE: It may be worth revisiting if we can crawl direct imports of the module since
			// `.importedModules` would also include modules that are dynamically watched, not imported.
			// That way we no longer need the below `continue` skips.

			// CSS requests `importedModules` are usually from `@import`, but we don't really need
			// to crawl into those as the `@import` code are already inlined into this `id`.
			// If CSS requests `importedModules` contain non-CSS files, e.g. Tailwind might add HMR
			// dependencies as `importedModules`, we should also skip them as they aren't really
			// imported. Without this, every hoisted script in the project is added to every page!
			if (isCSSRequest(id)) {
				continue;
			}
			// Some special Vite queries like `?url` or `?raw` are known to be a simple default export
			// and doesn't have any imports to crawl. However, since they would `this.addWatchFile` the
			// underlying module, our logic would crawl into them anyways which is incorrect as they
			// don't take part in the final rendering, so we skip it here.
			if (hasSpecialQueries(id)) {
				continue;
			}

			for (const importedModule of entry.importedModules) {
				if (!importedModule.id) continue;

				// some dynamically imported modules are *not* server rendered in time
				// to only SSR modules that we can safely transform, we check against
				// a list of file extensions based on our built-in vite plugins

				// Strip special query params like "?content".
				// NOTE: Cannot use `new URL()` here because not all IDs will be valid paths.
				// For example, `virtual:image-loader` if you don't have the plugin installed.
				const importedModulePathname = importedModule.id.replace(STRIP_QUERY_PARAMS_REGEX, '');

				const isFileTypeNeedingSSR = fileExtensionsToSSR.has(npath.extname(importedModulePathname));
				// A propagation stopping point is a module with the ?astroPropagatedAssets flag.
				// When we encounter one of these modules we don't want to continue traversing.
				const isPropagationStoppingPoint = importedModule.id.includes('?astroPropagatedAssets');
				if (
					isFileTypeNeedingSSR &&
					// Should not SSR a module with ?astroPropagatedAssets
					!isPropagationStoppingPoint
				) {
					const mod = loader.getModuleById(importedModule.id);
					if (!mod?.ssrModule) {
						try {
							await loader.import(importedModule.id);
						} catch {
							/** Likely an out-of-date module entry! Silently continue. */
						}
					}
				}

				// Make sure the `importedModule` traversed is explicitly imported by the user, and not by HMR
				// TODO: This isn't very performant. Maybe look into using `ssrTransformResult` but make sure it
				// doesn't regress UnoCSS. https://github.com/withastro/astro/issues/7529
				if (isImportedBy(id, importedModule) && !isPropagationStoppingPoint) {
					importedModules.add(importedModule);
				}
			}
		}
	}

	// scan imported modules for CSS imports & add them to our collection.
	// Then, crawl that file to follow and scan all deep imports as well.
	for (const importedModule of importedModules) {
		if (!importedModule.id || scanned.has(importedModule.id)) {
			continue;
		}

		yield importedModule;
		yield* crawlGraph(loader, importedModule.id, false, scanned);
	}
}

// Verify true imports. If the child module has the parent as an importers, it's
// a real import.
function isImportedBy(parent: string, entry: ModuleNode) {
	for (const importer of entry.importers) {
		if (importer.id === parent) {
			return true;
		}
	}
	return false;
}

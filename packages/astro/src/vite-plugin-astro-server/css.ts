import type { ModuleLoader } from '../core/module-loader/index.js';
import { viteID } from '../core/util.js';
import { isBuildableCSSRequest } from './util.js';
import { crawlGraph } from './vite.js';

interface ImportedStyle {
	id: string;
	url: string;
	content: string;
}

const inlineQueryRE = /(?:\?|&)inline(?:$|&)/;

/** Given a filePath URL, crawl Vite’s module graph to find all style imports. */
export async function getStylesForURL(
	filePath: URL,
	loader: ModuleLoader,
): Promise<{ urls: Set<string>; styles: ImportedStyle[]; crawledFiles: Set<string> }> {
	const importedCssUrls = new Set<string>();
	// Map of url to injected style object. Use a `url` key to deduplicate styles
	const importedStylesMap = new Map<string, ImportedStyle>();
	const crawledFiles = new Set<string>();

	for await (const importedModule of crawlGraph(loader, viteID(filePath), true)) {
		if (importedModule.file) {
			crawledFiles.add(importedModule.file);
		}
		if (isBuildableCSSRequest(importedModule.url)) {
			// In dev, we inline all styles if possible
			let css = '';
			// If this is a plain CSS module, the default export should be a string
			if (typeof importedModule.ssrModule?.default === 'string') {
				css = importedModule.ssrModule.default;
			}
			// Else try to load it
			else {
				let modId = importedModule.url;
				// Mark url with ?inline so Vite will return the CSS as plain string, even for CSS modules
				if (!inlineQueryRE.test(importedModule.url)) {
					if (importedModule.url.includes('?')) {
						modId = importedModule.url.replace('?', '?inline&');
					} else {
						modId += '?inline';
					}
				}
				try {
					// The SSR module is possibly not loaded. Load it if it's null.
					const ssrModule = await loader.import(modId);
					css = ssrModule.default;
				} catch {
					// The module may not be inline-able, e.g. SCSS partials. Skip it as it may already
					// be inlined into other modules if it happens to be in the graph.
					continue;
				}
			}

			importedStylesMap.set(importedModule.url, {
				id: importedModule.id ?? importedModule.url,
				url: importedModule.url,
				content: css,
			});
		}
	}

	return {
		urls: importedCssUrls,
		styles: [...importedStylesMap.values()],
		crawledFiles,
	};
}

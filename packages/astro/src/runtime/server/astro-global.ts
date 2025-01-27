import { ASTRO_VERSION } from '../../core/constants.js';
import { AstroError, AstroErrorData } from '../../core/errors/index.js';
import type { AstroGlobalPartial } from '../../types/public/context.js';

/** Create the Astro.glob() runtime function. */
function createAstroGlobFn() {
	const globHandler = (importMetaGlobResult: Record<string, any>) => {
		// This is created inside of the runtime so we don't have access to the Astro logger.
		console.warn(`Astro.glob is deprecated and will be removed in a future major version of Astro.
Use import.meta.glob instead: https://vitejs.dev/guide/features.html#glob-import`);

		if (typeof importMetaGlobResult === 'string') {
			throw new AstroError({
				...AstroErrorData.AstroGlobUsedOutside,
				message: AstroErrorData.AstroGlobUsedOutside.message(JSON.stringify(importMetaGlobResult)),
			});
		}
		let allEntries = [...Object.values(importMetaGlobResult)];
		if (allEntries.length === 0) {
			throw new AstroError({
				...AstroErrorData.AstroGlobNoMatch,
				message: AstroErrorData.AstroGlobNoMatch.message(JSON.stringify(importMetaGlobResult)),
			});
		}
		// Map over the `import()` promises, calling to load them.
		return Promise.all(allEntries.map((fn) => fn()));
	};
	// Cast the return type because the argument that the user sees (string) is different from the argument
	// that the runtime sees post-compiler (Record<string, Module>).
	return globHandler as unknown as AstroGlobalPartial['glob'];
}

// This is used to create the top-level Astro global; the one that you can use
// inside of getStaticPaths. See the `astroGlobalArgs` option for parameter type.
export function createAstro(site: string | undefined): AstroGlobalPartial {
	return {
		// TODO: this is no longer necessary for `Astro.site`
		// but it somehow allows working around caching issues in content collections for some tests
		site: site ? new URL(site) : undefined,
		generator: `Astro v${ASTRO_VERSION}`,
		glob: createAstroGlobFn(),
	};
}

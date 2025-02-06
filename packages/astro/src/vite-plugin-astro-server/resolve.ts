import type { ModuleLoader } from '../core/module-loader/index.js';
import { resolveIdToUrl } from '../core/viteUtils.js';

export function createResolve(loader: ModuleLoader, root: URL) {
	// Resolves specifiers in the inline hydrated scripts, such as:
	// - @astrojs/preact/client.js
	// - @/components/Foo.vue
	// - /Users/macos/project/src/Foo.vue
	// - C:/Windows/project/src/Foo.vue (normalized slash)
	return async function (s: string) {
		return await resolveIdToUrl(loader, s, root);
	};
}

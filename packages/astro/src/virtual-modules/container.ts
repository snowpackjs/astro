import type { AstroRenderer } from '../types/public/integrations.js';
import type { SSRLoadedRenderer } from '../types/public/internal.js';

/**
 * Use this function to provide renderers to the `AstroContainer`:
 *
 * ```js
 * import { getContainerRenderer } from "@astrojs/react";
 * import { experimental_AstroContainer as AstroContainer } from "astro/container";
 * import { loadRenderers } from "astro:container"; // use this only when using vite/vitest
 *
 * const renderers = await loadRenderers([ getContainerRenderer ]);
 * const container = await AstroContainer.create({ renderers });
 *
 * ```
 * @param renderers
 */
export async function loadRenderers(renderers: AstroRenderer[]) {
	const loadedRenderers = await Promise.all(
		renderers.map(async (renderer) => {
			const mod = await import(renderer.serverEntrypoint.toString());
			if (typeof mod.default !== 'undefined') {
				return {
					...renderer,
					ssr: mod.default,
				} as SSRLoadedRenderer;
			}
			return undefined;
		}),
	);

	return loadedRenderers.filter((r): r is SSRLoadedRenderer => Boolean(r));
}

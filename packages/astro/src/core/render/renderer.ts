import type { AstroRenderer } from '../../types/public/integrations.js';
import type { SSRLoadedRenderer } from '../../types/public/internal.js';
import type { ModuleLoader } from '../module-loader/index.js';

export async function loadRenderer(
	renderer: AstroRenderer,
	moduleLoader: ModuleLoader,
): Promise<SSRLoadedRenderer | undefined> {
	const mod = await moduleLoader.import(renderer.serverEntrypoint.toString());
	if (typeof mod.default !== 'undefined') {
		return {
			...renderer,
			ssr: mod.default,
		};
	}
	return undefined;
}

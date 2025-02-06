import { createRequire } from 'node:module';
import type { AstroSettings } from '../../types/astro.js';
import { adobe } from './providers/adobe.js';
import { google } from './providers/google.js';
import { local } from './providers/local.js';
import type { FontProvider, ResolvedFontProvider } from './types.js';
import { fileURLToPath } from 'node:url';
import type { ModuleLoader } from '../../core/module-loader/loader.js';

/** TODO: jsdoc */
export const fontProviders = {
	adobe,
	// TODO: reexport all unifont providers
};

function resolveEntrypoint(settings: AstroSettings, entrypoint: string): string {
	const require = createRequire(settings.config.root);

	try {
		return require.resolve(entrypoint);
	} catch {
		return fileURLToPath(new URL(entrypoint, settings.config.root));
	}
}

async function resolveMod(
	id: string,
	moduleLoader?: ModuleLoader,
): Promise<Pick<ResolvedFontProvider, 'provider'>> {
	try {
		const mod = await (moduleLoader ? moduleLoader.import(id) : import(id));
		if (!mod.provider && typeof mod.provider !== 'function') {
			// TODO: improve
			throw new Error('Not a function');
		}
		return {
			provider: mod.provider,
		};
	} catch (e) {
		// TODO: AstroError
		throw e;
	}
}

export async function resolveProviders({
	settings,
	providers: _providers,
	moduleLoader,
}: {
	settings: AstroSettings;
	providers: Array<FontProvider<any>>;
	moduleLoader?: ModuleLoader;
}): Promise<Array<ResolvedFontProvider>> {
	const providers = [google(), local(), ..._providers];
	const resolvedProviders: Array<ResolvedFontProvider> = [];

	for (const { name, entrypoint, config } of providers) {
		const id = resolveEntrypoint(settings, entrypoint.toString());
		const { provider } = await resolveMod(id, moduleLoader);
		resolvedProviders.push({ name, config, provider });
	}

	return resolvedProviders;
}

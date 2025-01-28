import type { UserConfig as ViteUserConfig, UserConfigFn as ViteUserConfigFn } from 'vite';
import { createRoutesList } from '../core/routing/index.js';
import type {
	AstroInlineConfig,
	AstroUserConfig,
	Locales,
	SessionDriverName,
} from '../types/public/config.js';
import { createDevelopmentManifest } from '../vite-plugin-astro-server/plugin.js';

/**
 * See the full Astro Configuration API Documentation
 * https://astro.build/config
 */
export function defineConfig<
	const TLocales extends Locales = never,
	const TDriver extends SessionDriverName = never,
>(config: AstroUserConfig<TLocales, TDriver>) {
	return config;
}

/**
 * Use Astro to generate a fully resolved Vite config
 */
export function getViteConfig(
	userViteConfig: ViteUserConfig,
	inlineAstroConfig: AstroInlineConfig = {},
): ViteUserConfigFn {
	// Return an async Vite config getter which exposes a resolved `mode` and `command`
	return async ({ mode, command }) => {
		// Vite `command` is `serve | build`, but Astro uses `dev | build`
		const cmd = command === 'serve' ? 'dev' : 'build';

		// Use dynamic import to avoid pulling in deps unless used
		const [
			fs,
			{ mergeConfig },
			{ createNodeLogger },
			{ resolveConfig, createSettings },
			{ createVite },
			{ runHookConfigSetup, runHookConfigDone },
			{ astroContentListenPlugin },
		] = await Promise.all([
			import('node:fs'),
			import('vite'),
			import('../core/config/logging.js'),
			import('../core/config/index.js'),
			import('../core/create-vite.js'),
			import('../integrations/hooks.js'),
			import('./vite-plugin-content-listen.js'),
		]);
		const logger = createNodeLogger(inlineAstroConfig);
		const { astroConfig: config } = await resolveConfig(inlineAstroConfig, cmd);
		let settings = await createSettings(config, userViteConfig.root);
		settings = await runHookConfigSetup({ settings, command: cmd, logger });
		const routesList = await createRoutesList({ settings }, logger);
		const manifest = createDevelopmentManifest(settings);
		const viteConfig = await createVite(
			{
				plugins: config.legacy.collections
					? [
							// Initialize the content listener
							astroContentListenPlugin({ settings, logger, fs }),
						]
					: [],
			},
			{ settings, command: cmd, logger, mode, sync: false, manifest, routesList },
		);
		await runHookConfigDone({ settings, logger });
		return mergeConfig(viteConfig, userViteConfig);
	};
}

import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bold } from 'kleur/colors';
import type { Plugin as VitePlugin } from 'vite';
import { warnMissingAdapter } from '../core/dev/adapter-validation.js';
import type { Logger } from '../core/logger/core.js';
import { getRoutePrerenderOption } from '../core/routing/manifest/prerender.js';
import { isEndpoint, isPage } from '../core/util.js';
import { normalizePath, rootRelativePath } from '../core/viteUtils.js';
import type { AstroSettings, RoutesList } from '../types/astro.js';

export interface AstroPluginScannerOptions {
	settings: AstroSettings;
	logger: Logger;
	routesList: RoutesList;
}

const KNOWN_FILE_EXTENSIONS = ['.astro', '.js', '.ts'];

export default function astroScannerPlugin({
	settings,
	logger,
	routesList,
}: AstroPluginScannerOptions): VitePlugin {
	return {
		name: 'astro:scanner',
		enforce: 'post',

		async transform(this, code, id, options) {
			if (!options?.ssr) return;

			const filename = normalizePath(id);
			let fileURL: URL;
			try {
				fileURL = new URL(`file://${filename}`);
			} catch {
				// If we can't construct a valid URL, exit early
				return;
			}

			const fileIsPage = isPage(fileURL, settings);
			const fileIsEndpoint = isEndpoint(fileURL, settings);
			if (!(fileIsPage || fileIsEndpoint)) return;

			const route = routesList.routes.find((r) => {
				const filePath = new URL(`./${r.component}`, settings.config.root);
				return normalizePath(fileURLToPath(filePath)) === filename;
			});

			if (!route) {
				return;
			}

			// `getStaticPaths` warning is just a string check, should be good enough for most cases
			if (
				!route.prerender &&
				code.includes('getStaticPaths') &&
				// this should only be valid for `.astro`, `.js` and `.ts` files
				KNOWN_FILE_EXTENSIONS.includes(extname(filename))
			) {
				logger.warn(
					'router',
					`getStaticPaths() ignored in dynamic page ${bold(
						rootRelativePath(settings.config.root, fileURL, true),
					)}. Add \`export const prerender = true;\` to prerender the page as static HTML during the build process.`,
				);
			}

			const { meta = {} } = this.getModuleInfo(id) ?? {};
			return {
				code,
				map: null,
				meta: {
					...meta,
					astro: {
						...(meta.astro ?? { hydratedComponents: [], clientOnlyComponents: [], scripts: [] }),
						pageOptions: {
							prerender: route.prerender,
						},
					},
				},
			};
		},

		// Handle hot updates to update the prerender option
		async handleHotUpdate(ctx) {
			const filename = normalizePath(ctx.file);
			let fileURL: URL;
			try {
				fileURL = new URL(`file://${filename}`);
			} catch {
				// If we can't construct a valid URL, exit early
				return;
			}

			const fileIsPage = isPage(fileURL, settings);
			const fileIsEndpoint = isEndpoint(fileURL, settings);
			if (!(fileIsPage || fileIsEndpoint)) return;

			const route = routesList.routes.find((r) => {
				const filePath = new URL(`./${r.component}`, settings.config.root);
				return normalizePath(fileURLToPath(filePath)) === filename;
			});

			if (!route) {
				return;
			}

			await getRoutePrerenderOption(await ctx.read(), route, settings, logger);
			warnMissingAdapter(logger, settings);
		},
	};
}

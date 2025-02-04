import type { Plugin } from 'vite';
import type { AstroSettings } from '../../types/astro.js';
import { resolveProviders } from './providers.js';
import * as unifont from 'unifont';
import type { FontFamily, FontProvider } from './types.js';
import xxhash from 'xxhash-wasm';
import { extname } from 'node:path';
import { getBuildOutputDir } from '../../core/build/util.js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { generateFontFace } from './utils.js';
import {
	DEFAULTS,
	VIRTUAL_MODULE_ID,
	RESOLVED_VIRTUAL_MODULE_ID,
	URL_PREFIX,
	CACHE_DIR,
} from './constants.js';
import { removeTrailingForwardSlash } from '@astrojs/internal-helpers/path';
import type { Logger } from '../../core/logger/core.js';
import { createCache, createStorage, type Cache } from './cache.js';

interface Options {
	settings: AstroSettings;
	sync: boolean;
	logger: Logger;
}

type PreloadData = Array<{ url: string; type: string }>;

const createLogManager = (logger: Logger) => {
	const done = new Set<string>();
	const items = new Set<string>();
	let id: NodeJS.Timeout | null = null;

	return {
		add: (value: string) => {
			if (done.has(value)) {
				return;
			}

			if (items.size === 0 && id === null) {
				logger.info('assets', 'Downloading fonts...');
			}
			items.add(value);
			if (id) {
				clearTimeout(id);
				id = null;
			}
		},
		remove: (value: string, cached: boolean) => {
			if (done.has(value)) {
				return;
			}

			items.delete(value);
			done.add(value);
			if (id) {
				clearTimeout(id);
				id = null;
			}
			id = setTimeout(() => {
				let msg = 'Done';
				if (cached) {
					msg += ' (loaded from cache)';
				}
				logger.info('assets', msg);
			}, 50);
		},
	};
};

export function fonts({ settings, sync, logger }: Options): Plugin {
	if (!settings.config.experimental.fonts) {
		// this is required because the virtual module does not exist
		// when fonts are not enabled, and that prevents rollup from building
		// TODO: remove once fonts are stabilized
		return {
			name: 'astro:fonts:fallback',
			config() {
				return {
					build: {
						rollupOptions: {
							external: [VIRTUAL_MODULE_ID],
						},
					},
				};
			},
		};
	}

	const providers: Array<FontProvider<string>> = settings.config.experimental.fonts.providers ?? [];
	const families: Array<FontFamily<string>> = settings.config.experimental.fonts.families;

	const baseUrl = removeTrailingForwardSlash(settings.config.base) + URL_PREFIX;

	let resolvedMap: Map<string, { preloadData: PreloadData; css: string }> | null = null;
	/** Key is `${hash}.${ext}`, value is a URL */
	let collected: Map<string, string> | null = null;
	let isBuild: boolean;
	let cache: Cache['cache'] | null = null;

	return {
		name: 'astro:fonts',
		config(_, { command }) {
			isBuild = command === 'build';
		},
		async buildStart() {
			const { h64ToString } = await xxhash();

			const resolved = await resolveProviders({
				settings,
				providers,
			});

			const storage = createStorage({
				// In build, first check the build cache then fallback to dev cache
				// In dev, only check dev cache
				bases: [
					new URL(CACHE_DIR, settings.dotAstroDir),
					...(isBuild ? [new URL(CACHE_DIR, settings.config.cacheDir)] : []),
				],
			});
			cache = createCache({ storage }).cache;

			const { resolveFont } = await unifont.createUnifont(
				resolved.map((e) => e.provider(e.config)),
				{ storage },
			);
			resolvedMap = new Map();
			collected = new Map();
			for (const family of families) {
				const resolvedOptions: unifont.ResolveFontOptions = {
					weights: family.weights ?? DEFAULTS.weights,
					styles: family.styles ?? DEFAULTS.styles,
					subsets: family.subsets ?? DEFAULTS.subsets,
					fallbacks: family.fallbacks ?? DEFAULTS.fallbacks,
				};
				// TODO: https://github.com/unjs/unifont/issues/108
				const { fonts: fontsData, fallbacks } = await resolveFont(family.name, resolvedOptions, [
					family.provider,
				]);

				// TODO: use fontaine if needed
				const preloadData: PreloadData = [];
				let css = '';
				for (const data of fontsData) {
					for (const source of data.src as unknown as Array<Record<string, string>>) {
						const key = 'name' in source ? 'name' : 'url';
						const hash = h64ToString(source[key]) + extname(source[key]);
						const url = baseUrl + hash;
						if (!collected.has(hash)) {
							collected.set(hash, source[key]);
							preloadData.push({ url, type: hash.split('.')[1] });
						}
						source[key] = url;
					}
					css += generateFontFace(family.name, data);
				}
				resolvedMap.set(family.name, { preloadData, css });
			}
		},
		async configureServer(server) {
			const logManager = createLogManager(logger);
			// Base is taken into account by default
			server.middlewares.use(URL_PREFIX, async (req, res, next) => {
				if (!req.url) {
					return next();
				}
				const hash = req.url.slice(1);
				const url = collected?.get(hash);
				if (!url) {
					return next();
				}
				logManager.add(hash);
				const { cached, data } = await cache!(hash, () =>
					fetch(url)
						.then((r) => r.arrayBuffer())
						.then((arr) => Buffer.from(arr).toString()),
				);
				logManager.remove(hash, cached);

				// TODO: add cache control back
				// TODO: set content type and cache control manually
				// const keys = ['cache-control', 'content-type', 'content-length'];
				// const keys = ['content-type', 'content-length'];
				// for (const key of keys) {
				// 	const value = response.headers.get(key);
				// 	if (value) {
				// 		res.setHeader(key, value);
				// 	}
				// }
				res.end(data);
			});
		},
		resolveId(id) {
			if (id === VIRTUAL_MODULE_ID) {
				return RESOLVED_VIRTUAL_MODULE_ID;
			}
		},
		load(id, opts) {
			if (id === RESOLVED_VIRTUAL_MODULE_ID && opts?.ssr) {
				return `
				export const fontsData = new Map(${JSON.stringify(Array.from(resolvedMap?.entries() ?? []))})
				`;
			}
		},
		async buildEnd() {
			resolvedMap = null;

			if (sync) {
				collected = null;
				cache = null;
				return;
			}

			const logManager = createLogManager(logger);
			const dir = getBuildOutputDir(settings);
			const fontsDir = new URL('.' + baseUrl, dir);
			mkdirSync(fontsDir, { recursive: true });
			await Promise.all(
				Array.from(collected!.entries()).map(async ([hash, url]) => {
					logManager.add(hash);
					const { cached, data } = await cache!(hash, () =>
						fetch(url)
							.then((r) => r.arrayBuffer())
							.then((arr) => Buffer.from(arr).toString()),
					);
					logManager.remove(hash, cached);
					writeFileSync(new URL(hash, fontsDir), data);
				}),
			);

			collected = null;
			cache = null;
		},
	};
}

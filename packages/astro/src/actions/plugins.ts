import type fsMod from 'node:fs';
import type { Plugin as VitePlugin } from 'vite';
import { shouldAppendForwardSlash } from '../core/build/util.js';
import type { AstroSettings } from '../types/astro.js';
import {
	NOOP_ACTIONS,
	RESOLVED_VIRTUAL_INTERNAL_MODULE_ID,
	RESOLVED_VIRTUAL_MODULE_ID,
	VIRTUAL_INTERNAL_MODULE_ID,
	VIRTUAL_MODULE_ID,
} from './consts.js';
import { isActionsFilePresent } from './utils.js';

/**
 * This plugin is responsible to load the known file `actions/index.js` / `actions.js`
 * If the file doesn't exist, it returns an empty object.
 * @param settings
 */
export function vitePluginUserActions({ settings }: { settings: AstroSettings }): VitePlugin {
	let resolvedActionsId: string;
	return {
		name: '@astro/plugin-actions',
		async resolveId(id) {
			if (id === NOOP_ACTIONS) {
				return NOOP_ACTIONS;
			}
			if (id === VIRTUAL_INTERNAL_MODULE_ID) {
				const resolvedModule = await this.resolve(
					`${decodeURI(new URL('actions', settings.config.srcDir).pathname)}`,
				);

				if (!resolvedModule) {
					return NOOP_ACTIONS;
				}
				resolvedActionsId = resolvedModule.id;
				return RESOLVED_VIRTUAL_INTERNAL_MODULE_ID;
			}
		},

		load(id) {
			if (id === NOOP_ACTIONS) {
				return 'export const server = {}';
			} else if (id === RESOLVED_VIRTUAL_INTERNAL_MODULE_ID) {
				return `export { server } from '${resolvedActionsId}';`;
			}
		},
	};
}

export function vitePluginActions({
	fs,
	settings,
}: {
	fs: typeof fsMod;
	settings: AstroSettings;
}): VitePlugin {
	return {
		name: VIRTUAL_MODULE_ID,
		enforce: 'pre',
		resolveId(id) {
			if (id === VIRTUAL_MODULE_ID) {
				return RESOLVED_VIRTUAL_MODULE_ID;
			}
		},
		async configureServer(server) {
			const filePresentOnStartup = await isActionsFilePresent(fs, settings.config.srcDir);
			// Watch for the actions file to be created.
			async function watcherCallback() {
				const filePresent = await isActionsFilePresent(fs, settings.config.srcDir);
				if (filePresentOnStartup !== filePresent) {
					server.restart();
				}
			}
			server.watcher.on('add', watcherCallback);
			server.watcher.on('change', watcherCallback);
		},
		async load(id, opts) {
			if (id !== RESOLVED_VIRTUAL_MODULE_ID) return;

			let code = await fs.promises.readFile(
				new URL('../../templates/actions.mjs', import.meta.url),
				'utf-8',
			);
			if (opts?.ssr) {
				code += `\nexport * from 'astro/actions/runtime/virtual/server.js';`;
			} else {
				code += `\nexport * from 'astro/actions/runtime/virtual/client.js';`;
			}
			code = code.replace(
				"'/** @TRAILING_SLASH@ **/'",
				JSON.stringify(
					shouldAppendForwardSlash(settings.config.trailingSlash, settings.config.build.format),
				),
			);
			return code;
		},
	};
}

import fsMod from 'node:fs';
import type { Plugin as VitePlugin } from 'vite';
import type { AstroIntegration, AstroSettings } from '../@types/astro.js';
import { ActionsWithoutServerOutputError } from '../core/errors/errors-data.js';
import { AstroError } from '../core/errors/errors.js';
import { isServerLikeOutput, viteID } from '../core/util.js';
import {
	ACTIONS_TYPES_FILE,
	NOOP_ACTIONS,
	RESOLVED_VIRTUAL_INTERNAL_MODULE_ID,
	RESOLVED_VIRTUAL_MODULE_ID,
	VIRTUAL_INTERNAL_MODULE_ID,
	VIRTUAL_MODULE_ID,
} from './consts.js';
import * as eslexer from 'es-module-lexer';

export default function astroActions({
	fs = fsMod,
	settings,
}: {
	fs?: typeof fsMod;
	settings: AstroSettings;
}): AstroIntegration {
	let isActionsUsed = false;
	let srcDir: URL | undefined;
	return {
		name: VIRTUAL_MODULE_ID,
		hooks: {
			async 'astro:config:setup'(params) {
				isActionsUsed = await usesActions(fs, params.config.srcDir);
				srcDir = params.config.srcDir;

				if (!isServerLikeOutput(params.config)) {
					const error = new AstroError(ActionsWithoutServerOutputError);
					error.stack = undefined;
					throw error;
				}

				params.updateConfig({
					vite: {
						plugins: [vitePluginUserActions({ settings }), vitePluginActions(fs)],
					},
				});

				// Only inject routes when actions are used.
				if (!isActionsUsed) return;

				params.injectRoute({
					pattern: '/_actions/[...path]',
					entrypoint: 'astro/actions/runtime/route.js',
					prerender: false,
				});

				params.addMiddleware({
					entrypoint: 'astro/actions/runtime/middleware.js',
					order: 'post',
				});
			},
			'astro:config:done': async (params) => {
				if (!isActionsUsed) return;

				const stringifiedActionsImport = JSON.stringify(
					viteID(new URL('./actions', params.config.srcDir)),
				);
				settings.injectedTypes.push({
					filename: ACTIONS_TYPES_FILE,
					content: `declare module "astro:actions" {
	type Actions = typeof import(${stringifiedActionsImport})["server"];

	export const actions: Actions;
}`,
				});
			},
			'astro:server:setup': async (params) => {
				if (isActionsUsed || !srcDir) return;

				// Watch for the actions file to be created.
				async function watcherCallback() {
					if (!isActionsUsed && (await usesActions(fs, srcDir!))) {
						params.server.restart();
					}
				}
				params.server.watcher.on('add', watcherCallback);
				params.server.watcher.on('change', watcherCallback);
			},
		},
	};
}

let didInitLexer = false;

async function usesActions(fs: typeof fsMod, srcDir: URL) {
	if (!didInitLexer) await eslexer.init;

	const actionsFile = search(fs, srcDir);
	if (!actionsFile) return false;

	let contents: string;
	try {
		contents = fs.readFileSync(actionsFile, 'utf-8');
	} catch {
		return false;
	}

	const [, exports] = eslexer.parse(contents, actionsFile.pathname);
	for (const exp of exports) {
		if (exp.n === 'server') {
			return true;
		}
	}
	return false;
}

function search(fs: typeof fsMod, srcDir: URL) {
	const paths = [
		'actions.mjs',
		'actions.js',
		'actions.mts',
		'actions.ts',
		'actions/index.mjs',
		'actions/index.js',
		'actions/index.mts',
		'actions/index.ts',
	].map((p) => new URL(p, srcDir));
	for (const file of paths) {
		if (fs.existsSync(file)) {
			return file;
		}
	}
	return undefined;
}

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

const vitePluginActions = (fs: typeof fsMod): VitePlugin => ({
	name: VIRTUAL_MODULE_ID,
	enforce: 'pre',
	resolveId(id) {
		if (id === VIRTUAL_MODULE_ID) {
			return RESOLVED_VIRTUAL_MODULE_ID;
		}
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
		return code;
	},
});

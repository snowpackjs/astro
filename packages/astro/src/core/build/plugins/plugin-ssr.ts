import type { Plugin as VitePlugin } from 'vite';
import type { AstroAdapter } from '../../../types/public/integrations.js';
import { routeIsRedirect } from '../../redirects/index.js';
import { VIRTUAL_ISLAND_MAP_ID } from '../../server-islands/vite-plugin-server-islands.js';
import { addRollupInput } from '../add-rollup-input.js';
import type { BuildInternals } from '../internal.js';
import type { AstroBuildPlugin } from '../plugin.js';
import type { StaticBuildOptions } from '../types.js';
import { SSR_MANIFEST_VIRTUAL_MODULE_ID } from './plugin-manifest.js';
import { MIDDLEWARE_MODULE_ID } from './plugin-middleware.js';
import { ASTRO_PAGE_MODULE_ID } from './plugin-pages.js';
import { RENDERERS_MODULE_ID } from './plugin-renderers.js';
import { getVirtualModulePageName } from './util.js';

export const SSR_VIRTUAL_MODULE_ID = '@astrojs-ssr-virtual-entry';
export const RESOLVED_SSR_VIRTUAL_MODULE_ID = '\0' + SSR_VIRTUAL_MODULE_ID;

const ADAPTER_VIRTUAL_MODULE_ID = '@astrojs-ssr-adapter';
const RESOLVED_ADAPTER_VIRTUAL_MODULE_ID = '\0' + ADAPTER_VIRTUAL_MODULE_ID;

function vitePluginAdapter(adapter: AstroAdapter): VitePlugin {
	return {
		name: '@astrojs/vite-plugin-astro-adapter',
		enforce: 'post',
		resolveId(id) {
			if (id === ADAPTER_VIRTUAL_MODULE_ID) {
				return RESOLVED_ADAPTER_VIRTUAL_MODULE_ID;
			}
		},
		async load(id) {
			if (id === RESOLVED_ADAPTER_VIRTUAL_MODULE_ID) {
				return `export * from ${JSON.stringify(adapter.serverEntrypoint)};`;
			}
		},
	};
}

function vitePluginSSR(
	internals: BuildInternals,
	adapter: AstroAdapter,
	options: StaticBuildOptions,
): VitePlugin {
	return {
		name: '@astrojs/vite-plugin-astro-ssr-server',
		enforce: 'post',
		options(opts) {
			const inputs = new Set<string>();

			for (const pageData of Object.values(options.allPages)) {
				if (routeIsRedirect(pageData.route)) {
					continue;
				}
				inputs.add(getVirtualModulePageName(ASTRO_PAGE_MODULE_ID, pageData.component));
			}

			const adapterServerEntrypoint = options.settings.adapter?.serverEntrypoint;
			if (adapterServerEntrypoint) {
				inputs.add(ADAPTER_VIRTUAL_MODULE_ID);
			}

			inputs.add(SSR_VIRTUAL_MODULE_ID);
			return addRollupInput(opts, Array.from(inputs));
		},
		resolveId(id) {
			if (id === SSR_VIRTUAL_MODULE_ID) {
				return RESOLVED_SSR_VIRTUAL_MODULE_ID;
			}
		},
		async load(id) {
			if (id === RESOLVED_SSR_VIRTUAL_MODULE_ID) {
				const { allPages } = options;
				const imports: string[] = [];
				const contents: string[] = [];
				const exports: string[] = [];
				let i = 0;
				const pageMap: string[] = [];

				for (const pageData of Object.values(allPages)) {
					if (routeIsRedirect(pageData.route)) {
						continue;
					}
					const virtualModuleName = getVirtualModulePageName(
						ASTRO_PAGE_MODULE_ID,
						pageData.component,
					);
					let module = await this.resolve(virtualModuleName);
					if (module) {
						const variable = `_page${i}`;
						// we need to use the non-resolved ID in order to resolve correctly the virtual module
						imports.push(`const ${variable} = () => import("${virtualModuleName}");`);

						const pageData2 = internals.pagesByKeys.get(pageData.key);
						if (pageData2) {
							pageMap.push(`[${JSON.stringify(pageData2.component)}, ${variable}]`);
						}
						i++;
					}
				}
				contents.push(`const pageMap = new Map([\n    ${pageMap.join(',\n    ')}\n]);`);
				exports.push(`export { pageMap }`);
				const middleware = await this.resolve(MIDDLEWARE_MODULE_ID);
				const ssrCode = generateSSRCode(adapter, middleware!.id);
				imports.push(...ssrCode.imports);
				contents.push(...ssrCode.contents);
				return [...imports, ...contents, ...exports].join('\n');
			}
		},
		async generateBundle(_opts, bundle) {
			// Add assets from this SSR chunk as well.
			for (const [, chunk] of Object.entries(bundle)) {
				if (chunk.type === 'asset') {
					internals.staticFiles.add(chunk.fileName);
				}
			}

			for (const [, chunk] of Object.entries(bundle)) {
				if (chunk.type === 'asset') {
					continue;
				}
				if (chunk.modules[RESOLVED_SSR_VIRTUAL_MODULE_ID]) {
					internals.ssrEntryChunk = chunk;
				}
			}
		},
	};
}

export function pluginSSR(
	options: StaticBuildOptions,
	internals: BuildInternals,
): AstroBuildPlugin {
	const ssr = options.settings.buildOutput === 'server';
	return {
		targets: ['server'],
		hooks: {
			'build:before': () => {
				// We check before this point if there's an adapter, so we can safely assume it exists here.
				const adapter = options.settings.adapter!;
				const ssrPlugin = ssr && vitePluginSSR(internals, adapter, options);
				const vitePlugin = [vitePluginAdapter(adapter)];
				if (ssrPlugin) {
					vitePlugin.unshift(ssrPlugin);
				}

				return {
					enforce: 'after-user-plugins',
					vitePlugin: vitePlugin,
				};
			},
			'build:post': async () => {
				if (!ssr) {
					return;
				}

				if (!internals.ssrEntryChunk) {
					throw new Error(`Did not generate an entry chunk for SSR`);
				}
				// Mutate the filename
				internals.ssrEntryChunk.fileName = options.settings.config.build.serverEntry;
			},
		},
	};
}

function generateSSRCode(adapter: AstroAdapter, middlewareId: string) {
	const edgeMiddleware = adapter?.adapterFeatures?.edgeMiddleware ?? false;

	const imports = [
		`import { renderers } from '${RENDERERS_MODULE_ID}';`,
		`import * as serverEntrypointModule from '${ADAPTER_VIRTUAL_MODULE_ID}';`,
		`import { manifest as defaultManifest } from '${SSR_MANIFEST_VIRTUAL_MODULE_ID}';`,
		`import { serverIslandMap } from '${VIRTUAL_ISLAND_MAP_ID}';`,
	];

	const contents = [
		edgeMiddleware ? `const middleware = (_, next) => next()` : '',
		`const _manifest = Object.assign(defaultManifest, {`,
		`    pageMap,`,
		`    serverIslandMap,`,
		`    renderers,`,
		`    middleware: ${edgeMiddleware ? 'undefined' : `() => import("${middlewareId}")`}`,
		`});`,
		`const _args = ${adapter.args ? JSON.stringify(adapter.args, null, 4) : 'undefined'};`,
		adapter.exports
			? `const _exports = serverEntrypointModule.createExports(_manifest, _args);`
			: '',
		...(adapter.exports?.map((name) => {
			if (name === 'default') {
				return `export default _exports.default;`;
			} else {
				return `export const ${name} = _exports['${name}'];`;
			}
		}) ?? []),
		// NOTE: This is intentionally obfuscated!
		// Do NOT simplify this to something like `serverEntrypointModule.start?.(_manifest, _args)`
		// They are NOT equivalent! Some bundlers will throw if `start` is not exported, but we
		// only want to silently ignore it... hence the dynamic, obfuscated weirdness.
		`const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}`,
	];

	return {
		imports,
		contents,
	};
}

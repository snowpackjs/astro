import path from 'node:path';
import type { CompilerOptions } from 'typescript';
import { type ResolvedConfig, type Plugin as VitePlugin, normalizePath } from 'vite';
import type { AstroSettings } from '../types/astro.js';

type Alias = {
	find: RegExp;
	replacement: string;
};

/** Returns a list of compiled aliases. */
const getConfigAlias = (settings: AstroSettings): Alias[] | null => {
	const { tsConfig, tsConfigPath } = settings;
	if (!tsConfig || !tsConfigPath || !tsConfig.compilerOptions) return null;

	const { baseUrl, paths } = tsConfig.compilerOptions as CompilerOptions;
	if (!baseUrl) return null;

	// resolve the base url from the configuration file directory
	const resolvedBaseUrl = path.resolve(path.dirname(tsConfigPath), baseUrl);

	const aliases: Alias[] = [];

	// compile any alias expressions and push them to the list
	if (paths) {
		for (const [alias, values] of Object.entries(paths)) {
			/** Regular Expression used to match a given path. */
			const find = new RegExp(
				`^${[...alias]
					.map((segment) =>
						segment === '*' ? '(.+)' : segment.replace(/[\\^$*+?.()|[\]{}]/, '\\$&'),
					)
					.join('')}$`,
			);

			for (const value of values) {
				/** Internal index used to calculate the matching id in a replacement. */
				let matchId = 0;
				/** String used to replace a matched path. */
				const replacement = [...normalizePath(path.resolve(resolvedBaseUrl, value))]
					.map((segment) => (segment === '*' ? `$${++matchId}` : segment === '$' ? '$$' : segment))
					.join('');

				aliases.push({ find, replacement });
			}
		}
	}

	// compile the baseUrl expression and push it to the list
	// - `baseUrl` changes the way non-relative specifiers are resolved
	// - if `baseUrl` exists then all non-relative specifiers are resolved relative to it
	aliases.push({
		find: /^(?!\.*\/|\.*$|\w:)(.+)$/,
		replacement: `${[...normalizePath(resolvedBaseUrl)]
			.map((segment) => (segment === '$' ? '$$' : segment))
			.join('')}/$1`,
	});

	return aliases;
};

/** Returns a Vite plugin used to alias paths from tsconfig.json and jsconfig.json. */
export default function configAliasVitePlugin({
	settings,
}: {
	settings: AstroSettings;
}): VitePlugin | null {
	const configAlias = getConfigAlias(settings);
	if (!configAlias) return null;

	const plugin: VitePlugin = {
		name: 'astro:tsconfig-alias',
		// use post to only resolve ids that all other plugins before it can't
		enforce: 'post',
		configResolved(config) {
			patchCreateResolver(config, plugin);
		},
		async resolveId(id, importer, options) {
			if (isVirtualId(id)) return;

			// Handle aliases found from `compilerOptions.paths`. Unlike Vite aliases, tsconfig aliases
			// are best effort only, so we have to manually replace them here, instead of using `vite.resolve.alias`
			for (const alias of configAlias) {
				if (alias.find.test(id)) {
					const updatedId = id.replace(alias.find, alias.replacement);

					// Vite may pass an id with "*" when resolving glob import paths
					// Returning early allows Vite to handle the final resolution
					// See https://github.com/withastro/astro/issues/9258#issuecomment-1838806157
					if (updatedId.includes('*')) {
						return updatedId;
					}

					const resolved = await this.resolve(updatedId, importer, { skipSelf: true, ...options });
					if (resolved) return resolved;
				}
			}
		},
	};

	return plugin;
}

/**
 * Vite's `createResolver` is used to resolve various things, including CSS `@import`.
 * However, there's no way to extend this resolver, besides patching it. This function
 * patches and adds a Vite plugin whose `resolveId` will be used to resolve before the
 * internal plugins in `createResolver`.
 *
 * Vite may simplify this soon: https://github.com/vitejs/vite/pull/10555
 */
function patchCreateResolver(config: ResolvedConfig, postPlugin: VitePlugin) {
	const _createResolver = config.createResolver;
	// @ts-expect-error override readonly property intentionally
	config.createResolver = function (...args1: any) {
		const resolver = _createResolver.apply(config, args1);
		return async function (...args2: any) {
			const id: string = args2[0];
			const importer: string | undefined = args2[1];
			const ssr: boolean | undefined = args2[3];

			// fast path so we don't run this extensive logic in prebundling
			if (importer?.includes('node_modules')) {
				return resolver.apply(_createResolver, args2);
			}

			const fakePluginContext = {
				resolve: (_id: string, _importer?: string) => resolver(_id, _importer, false, ssr),
			};
			const fakeResolveIdOpts = {
				assertions: {},
				isEntry: false,
				ssr,
			};

			const result = await resolver.apply(_createResolver, args2);
			if (result) return result;

			// @ts-expect-error resolveId exists
			const resolved = await postPlugin.resolveId.apply(fakePluginContext, [
				id,
				importer,
				fakeResolveIdOpts,
			]);
			if (resolved) return resolved;
		};
	};
}

function isVirtualId(id: string) {
	return id.includes('\0') || id.startsWith('virtual:') || id.startsWith('astro:');
}

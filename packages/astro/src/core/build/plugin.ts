import type { Rollup, Plugin as VitePlugin } from 'vite';
import type { BuildInternals } from './internal.js';
import type { StaticBuildOptions, ViteBuildReturn } from './types.js';

type RollupOutputArray = Extract<ViteBuildReturn, Array<any>>;
type OutputChunkorAsset = RollupOutputArray[number]['output'][number];
type OutputChunk = Extract<OutputChunkorAsset, { type: 'chunk' }>;
export type BuildTarget = 'server' | 'client';

type MutateChunk = (chunk: OutputChunk, targets: BuildTarget[], newCode: string) => void;

export interface BuildBeforeHookResult {
	enforce?: 'after-user-plugins';
	vitePlugin: VitePlugin | VitePlugin[] | undefined;
}

export type AstroBuildPlugin = {
	targets: BuildTarget[];
	hooks?: {
		'build:before'?: (opts: {
			target: BuildTarget;
			input: Set<string>;
		}) => BuildBeforeHookResult | Promise<BuildBeforeHookResult>;
		'build:post'?: (opts: {
			ssrOutputs: RollupOutputArray;
			clientOutputs: RollupOutputArray;
			mutate: MutateChunk;
		}) => void | Promise<void>;
	};
};

export function createPluginContainer(options: StaticBuildOptions, internals: BuildInternals) {
	const plugins = new Map<BuildTarget, AstroBuildPlugin[]>();
	const allPlugins = new Set<AstroBuildPlugin>();
	for (const target of ['client', 'server'] satisfies BuildTarget[]) {
		plugins.set(target, []);
	}

	return {
		options,
		internals,
		register(plugin: AstroBuildPlugin) {
			allPlugins.add(plugin);
			for (const target of plugin.targets) {
				const targetPlugins = plugins.get(target) ?? [];
				targetPlugins.push(plugin);
				plugins.set(target, targetPlugins);
			}
		},

		// Hooks
		async runBeforeHook(target: BuildTarget, input: Set<string>) {
			let targetPlugins = plugins.get(target) ?? [];
			let vitePlugins: Array<VitePlugin | VitePlugin[]> = [];
			let lastVitePlugins: Array<VitePlugin | VitePlugin[]> = [];
			for (const plugin of targetPlugins) {
				if (plugin.hooks?.['build:before']) {
					let result = await plugin.hooks['build:before']({ target, input });
					if (result.vitePlugin) {
						vitePlugins.push(result.vitePlugin);
					}
				}
			}

			return {
				vitePlugins,
				lastVitePlugins,
			};
		},

		async runPostHook(ssrOutputs: Rollup.RollupOutput[], clientOutputs: Rollup.RollupOutput[]) {
			const mutations = new Map<
				string,
				{
					targets: BuildTarget[];
					code: string;
				}
			>();

			const mutate: MutateChunk = (chunk, targets, newCode) => {
				chunk.code = newCode;
				mutations.set(chunk.fileName, {
					targets,
					code: newCode,
				});
			};

			for (const plugin of allPlugins) {
				const postHook = plugin.hooks?.['build:post'];
				if (postHook) {
					await postHook({
						ssrOutputs,
						clientOutputs,
						mutate,
					});
				}
			}

			return mutations;
		},
	};
}

export type AstroBuildPluginContainer = ReturnType<typeof createPluginContainer>;

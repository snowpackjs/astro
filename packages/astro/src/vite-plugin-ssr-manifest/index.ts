import type { Plugin as VitePlugin } from 'vite';

const manifestVirtualModuleId = 'astro:ssr-manifest';
const resolvedManifestVirtualModuleId = '\0' + manifestVirtualModuleId;

export function vitePluginSSRManifest(): VitePlugin {
	return {
		name: '@astrojs/vite-plugin-astro-ssr-manifest',
		enforce: 'post',
		resolveId(id) {
			if (id === manifestVirtualModuleId) {
				return resolvedManifestVirtualModuleId;
			}
		},
		load(id) {
			if (id === resolvedManifestVirtualModuleId) {
				return `export let manifest = {};
export function _privateSetManifestDontUseThis(ssrManifest) {
  manifest = ssrManifest;
}`;
			}
			return void 0;
		},
	};
}

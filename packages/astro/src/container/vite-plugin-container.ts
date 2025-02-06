import type * as vite from 'vite';

const virtualModuleId = 'astro:container';

export default function astroContainer(): vite.Plugin {
	return {
		name: 'astro:container',
		enforce: 'pre',
		resolveId(id) {
			if (id === virtualModuleId) {
				return this.resolve('astro/virtual-modules/container.js');
			}
		},
	};
}

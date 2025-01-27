import type { Options } from '@sveltejs/vite-plugin-svelte';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import type { AstroIntegration, AstroRenderer, ContainerRenderer } from 'astro';

function getRenderer(): AstroRenderer {
	return {
		name: '@astrojs/svelte',
		clientEntrypoint: '@astrojs/svelte/client.js',
		serverEntrypoint: '@astrojs/svelte/server.js',
	};
}

export function getContainerRenderer(): ContainerRenderer {
	return {
		name: '@astrojs/svelte',
		serverEntrypoint: '@astrojs/svelte/server.js',
	};
}

export default function svelteIntegration(options?: Options): AstroIntegration {
	return {
		name: '@astrojs/svelte',
		hooks: {
			'astro:config:setup': async ({ updateConfig, addRenderer }) => {
				addRenderer(getRenderer());
				updateConfig({
					vite: {
						optimizeDeps: {
							include: ['@astrojs/svelte/client.js'],
							exclude: ['@astrojs/svelte/server.js'],
						},
						plugins: [svelte(options)],
					},
				});
			},
		},
	};
}

export { vitePreprocess };

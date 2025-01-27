import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [
		{
			name: 'astropi',
			hooks: {
				'astro:config:setup': async ({ injectRoute, config }) => {
					injectRoute({
						pattern: `/injected-a`,
						entrypoint: './src/to-inject.astro',
						prerender: true,
					});
					injectRoute({
						pattern: `/injected-b`,
						entrypoint: './src/to-inject.astro',
						prerender: true,
					});
					injectRoute({
						pattern: `/dynamic-a/[id]`,
						entrypoint: './src/[id].astro',
						prerender: true,
					});
					injectRoute({
						pattern: `/dynamic-b/[id]`,
						entrypoint: './src/[id].astro',
						prerender: true,
					});
					injectRoute({
						pattern: `/dynamic-c/[id]`,
						entrypoint: new URL('./[id].astro', config.srcDir),
						prerender: true,
					})
				},
			},
		},
	],
});

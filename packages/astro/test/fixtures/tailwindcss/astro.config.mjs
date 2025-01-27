import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [
		tailwind({
			configFile: fileURLToPath(new URL('./tailwind.config.js', import.meta.url)),
		}),
		mdx(),
	],
	vite: {
		build: {
			assetsInlineLimit: 0,
		},
	},
});

import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite"

// https://astro.build/config
export default defineConfig({
	integrations: [mdx()],
	vite: {
		plugins: [tailwindcss()],
		build: {
			assetsInlineLimit: 0,
		},
	},
});

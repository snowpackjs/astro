import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	base: '/docs',
	integrations: [mdx()],
	vite: {
		build: {
			assetsInlineLimit: 0
		}
	},
});

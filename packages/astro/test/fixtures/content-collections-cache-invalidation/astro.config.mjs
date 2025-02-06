import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	base: '/docs',
	compressHTML: false,
	vite: {
		build: {
			assetsInlineLimit: 0,
		}
	}
});

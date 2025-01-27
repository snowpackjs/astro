import { defineConfig } from 'astro/config';

export default defineConfig({
	vite: {
		build: {
			assetsInlineLimit: 100,
		},
	},
});

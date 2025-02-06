import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	devToolbar: {
		enabled: false,
	},
	vite: {
		plugins: [tailwindcss()],
		build: {
			assetsInlineLimit: 0,
		},
	},
});

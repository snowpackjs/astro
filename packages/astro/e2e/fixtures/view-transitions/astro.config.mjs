import nodejs from '@astrojs/node';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import solidjs from '@astrojs/solid-js';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	adapter: nodejs({ mode: 'standalone' }),
	integrations: [react( {
		exclude: ['**/solid/**'],
	}),vue(),svelte(),solidjs({
		include: ['**/solid/**'],
	})],
	redirects: {
		'/redirect-two': '/two',
		'/redirect-external': 'http://example.com/',
	},
	devToolbar: {
		enabled: false,
	},
	vite: {
		build: {
			assetsInlineLimit: 0,
		},
	},
});

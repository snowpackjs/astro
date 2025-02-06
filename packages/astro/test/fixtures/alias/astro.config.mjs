import svelte from '@astrojs/svelte';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [svelte()],
	vite: {
		resolve: {
			alias: [
				{ find:/^component:(.*)$/, replacement: '/src/components/$1' }
			]
		}
	}
});

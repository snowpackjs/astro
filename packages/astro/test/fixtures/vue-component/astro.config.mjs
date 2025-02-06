import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.includes('my-button'),
				},
				// Don't transform img src to imports
				transformAssetUrls: {
					includeAbsolute: false,
				},
			},
		}),
	],
});

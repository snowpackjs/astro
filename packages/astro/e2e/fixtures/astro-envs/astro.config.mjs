import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'http://example.com',
	base: '/blog',
	devToolbar: {
		enabled: false,
	},
	integrations: [vue()],
});

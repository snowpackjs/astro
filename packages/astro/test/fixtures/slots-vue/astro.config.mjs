import mdx from '@astrojs/mdx';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [vue(), mdx()],
});

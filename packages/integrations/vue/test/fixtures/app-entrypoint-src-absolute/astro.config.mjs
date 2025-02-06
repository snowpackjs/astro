import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [vue({
		appEntrypoint: '/src/vue.ts'
	})]
})

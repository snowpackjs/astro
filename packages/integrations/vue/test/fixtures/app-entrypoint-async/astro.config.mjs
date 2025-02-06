import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';
import ViteSvgLoader from 'vite-svg-loader'

export default defineConfig({
  integrations: [vue({
		appEntrypoint: '/src/pages/_app'
	})],
	vite: {
    plugins: [
      ViteSvgLoader(),
    ],
	},
})

import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  integrations: [mdx()],
	vite: {
		resolve: {
			alias: {
				'@images': fileURLToPath(new URL('./images', import.meta.url))
			}
		},
	},
});

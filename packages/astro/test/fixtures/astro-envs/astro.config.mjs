import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'http://example.com',
	base: '/blog',
	integrations: [vue()],
	vite: {
		plugins: [
			{
				// Plugin so that we can see in the tests whether the env has been injected
				name: 'export-env-plugin',
				enforce: 'post',
				transform(code, id) {
					if (id.endsWith('.json')) {
						return `${code}\n export const env = ${JSON.stringify(code.includes('CHESHIRE') || code.includes('process.env.KITTY') ? 'CHESHIRE' : 'A MYSTERY')}`;
					}
				},
			},
		],
	},
});

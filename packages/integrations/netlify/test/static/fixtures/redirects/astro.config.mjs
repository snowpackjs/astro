import netlify from '@astrojs/netlify';
import { defineConfig } from 'astro/config';

export default defineConfig({
	output: 'static',
	adapter: netlify(),
	site: "http://example.com",
	redirects: {
		'/other': '/',
		'/two': {
			status: 302,
			destination: '/',
		},
		'/blog/[...slug]': '/team/articles/[...slug]',
	},
});

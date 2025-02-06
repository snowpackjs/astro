// @ts-check
import netlify from '@astrojs/netlify';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  site: 'http://example.com',
	experimental: {
		session: true
	}
});

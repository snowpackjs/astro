import netlify from '@astrojs/netlify';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  adapter: netlify(),
  site: `http://example.com`,
  redirects: {
    '/other': '/',
  },
});

import netlify from '@astrojs/netlify';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  site: `http://example.com`,
  security: {
    checkOrigin: false
  }
});
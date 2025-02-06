import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [sitemap()],
	site: 'http://example.com'
})

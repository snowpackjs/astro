import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  adapter: vercel({}),
  integrations: [sitemap()]
});
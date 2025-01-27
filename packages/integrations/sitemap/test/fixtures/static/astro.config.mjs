import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [sitemap({
      i18n: {
          defaultLocale: 'it',
          locales: {
              it: 'it-IT',
              de: 'de-DE',
          }
      }
  })],
	site: 'http://example.com',
      redirects: {
        '/redirect': '/'
      },
})

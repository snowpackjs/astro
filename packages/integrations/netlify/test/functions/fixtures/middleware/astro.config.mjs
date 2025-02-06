import netlify from '@astrojs/netlify';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: netlify({
    edgeMiddleware: process.env.EDGE_MIDDLEWARE === 'true',
    imageCDN: process.env.DISABLE_IMAGE_CDN ? false : undefined,
  }),
  image: {
    remotePatterns: [{
      protocol: 'https',
      hostname: '*.example.org',
      pathname: '/images/*',
    }],
    domains: ['example.net', 'secret.example.edu'],
  },
  site: `http://example.com`,
});
import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [preact()],
	site: 'http://example.com',
	base: '/subpath',
	ssr: {
		noExternal: ['@test/static-build-pkg'],
	},
  redirects: {
    '/old': '/new',
  },
});

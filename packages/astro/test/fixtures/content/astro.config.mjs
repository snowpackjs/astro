import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [mdx()],
	legacy: {
		// Enable legacy content collections as we test layout fields
		collections: true
	}
});

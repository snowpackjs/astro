import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [preact(), mdx()],
	// make sure CLI flags have precedence
  server: () => ({ port: 4321 }),
  vite: {
  	build: {
  		sourcemap: true,
  	}
  }
});

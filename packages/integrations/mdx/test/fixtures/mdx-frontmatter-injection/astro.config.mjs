import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import { rehypeReadingTime, remarkDescription, remarkTitle } from './src/markdown-plugins.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://astro.build/',
	integrations: [mdx({
		remarkPlugins: [remarkTitle, remarkDescription],
		rehypePlugins: [rehypeReadingTime],
	})],
});

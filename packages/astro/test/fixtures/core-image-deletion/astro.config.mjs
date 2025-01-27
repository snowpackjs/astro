import markdoc from '@astrojs/markdoc';
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [mdx(), markdoc()],
});

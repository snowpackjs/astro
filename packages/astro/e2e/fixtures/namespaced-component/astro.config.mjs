import mdx from "@astrojs/mdx";
import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), mdx()]
});

import svelte from '@astrojs/svelte';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  integrations: [
    svelte()
  ],
});

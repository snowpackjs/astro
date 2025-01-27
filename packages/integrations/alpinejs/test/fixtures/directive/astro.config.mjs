import alpine from '@astrojs/alpinejs';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [alpine({
    entrypoint: "./src/entrypoint.ts"
  })],
})

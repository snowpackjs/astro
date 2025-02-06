import svelte from '@astrojs/svelte';
import { defineConfig } from 'astro/config';
import testAdapter from '../../../test-adapter.js';

export default defineConfig({
  adapter: testAdapter(),
  output: 'server',
  integrations: [
    svelte()
  ],
});


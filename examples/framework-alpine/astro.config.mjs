// @ts-check
import { defineConfig } from 'astro/config';
import alpine from '@astrojs/alpinejs';

// https://astro.build/config
export default defineConfig({
	integrations: [alpine()],
});

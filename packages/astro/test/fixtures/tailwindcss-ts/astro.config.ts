import { fileURLToPath } from 'node:url';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [
		tailwind({
			configFile: fileURLToPath(new URL('./tailwind.config.js', import.meta.url)),
		}),
	],
});

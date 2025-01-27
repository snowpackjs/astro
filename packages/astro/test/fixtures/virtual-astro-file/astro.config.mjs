import { defineConfig } from 'astro/config';
import myPlugin from './src/plugin/my-plugin.mjs';

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [myPlugin()]
	}
});

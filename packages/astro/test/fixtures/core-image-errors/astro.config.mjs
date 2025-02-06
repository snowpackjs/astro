// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
	legacy: {
		// Needed because we're using image().refine()
		collections: true,
	},
});

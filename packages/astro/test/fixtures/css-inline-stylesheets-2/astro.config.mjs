import { defineConfig } from 'astro/config';

export default defineConfig({
	legacy: {
		// Enable legacy content collections as we test layout fields
		collections: true
	}
});

import {defineConfig} from 'astro/config';

// https://astro.build/config
export default defineConfig({
	output: "server",
	site: "https://example.com",
	security: {
		checkOrigin: false
	}
});

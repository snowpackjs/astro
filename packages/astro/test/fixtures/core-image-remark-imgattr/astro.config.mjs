import { defineConfig } from 'astro/config';
import plugin from "./remarkPlugin"

// https://astro.build/config
export default defineConfig({
	markdown: {
		remarkPlugins:[plugin]
	}
});

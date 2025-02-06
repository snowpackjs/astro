import { defineConfig } from 'astro/config';

export default defineConfig({
	vite: {
		build: {
			cssTarget: "safari14",
		}
	}
})

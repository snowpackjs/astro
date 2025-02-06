import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';

export default defineConfig({
	output: "server",
	adapter: vercel({
		maxDuration: 60
	})
});

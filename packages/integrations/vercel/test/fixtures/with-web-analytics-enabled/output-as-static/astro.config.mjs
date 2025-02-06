import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';

export default defineConfig({
	adapter: vercel({
		webAnalytics: {
			enabled: true
		}
	})
});

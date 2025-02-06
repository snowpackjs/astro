import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';

export default defineConfig({
	adapter: vercel({
		// Pass some value to make sure it doesn't error out
		includeFiles: ['included.js'],
	}),
	output: 'server'
});

import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';

export default defineConfig({
	output: 'static',
	adapter: vercel(),
});

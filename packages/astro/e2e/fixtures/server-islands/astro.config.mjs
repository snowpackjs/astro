import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import nodejs from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
	base: '/base',
	output: 'static',
	adapter: nodejs({ mode: 'standalone' }),
	integrations: [react(), mdx()],
	trailingSlash: process.env.TRAILING_SLASH ?? 'always',
});

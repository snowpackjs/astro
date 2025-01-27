import db from '@astrojs/db';
import node from '@astrojs/node';
import webVitals from '@astrojs/web-vitals';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [db(), webVitals()],
	output: 'static',
	adapter: node({ mode: 'standalone' }),
	devToolbar: {
		enabled: false,
	},
});

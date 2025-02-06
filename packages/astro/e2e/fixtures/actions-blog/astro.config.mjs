import { defineConfig } from 'astro/config';
import db from '@astrojs/db';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [db(), react()],
	output: 'server',
	adapter: node({
		mode: 'standalone',
	}),
});

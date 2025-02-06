import db from '@astrojs/db';
import node from '@astrojs/node';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import simpleStackForm from 'simple-stack-form';

// https://astro.build/config
export default defineConfig({
	integrations: [simpleStackForm(), db(), react()],
	output: 'server',
	adapter: node({
		mode: 'standalone',
	}),
});

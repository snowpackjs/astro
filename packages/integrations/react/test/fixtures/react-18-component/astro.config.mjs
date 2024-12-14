import react from '@astrojs/react';
import vue from '@astrojs/vue';
import solid from '@astrojs/solid-js';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [react({
		experimentalReactChildren: true,
	}),	solid({
		include: ['**/*.solid.jsx'],
	}), vue()],
});
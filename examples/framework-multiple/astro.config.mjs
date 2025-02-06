// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';
import solid from '@astrojs/solid-js';

// https://astro.build/config
export default defineConfig({
	// Enable many frameworks to support all different kinds of components.
	integrations: [
		preact({ include: ['**/preact/*'] }),
		solid({ include: ['**/solid/*'] }),
		react({ include: ['**/react/*'] }),
		svelte(),
		vue(),
	],
});

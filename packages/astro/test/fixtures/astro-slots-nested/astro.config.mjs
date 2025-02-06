import preact from '@astrojs/preact';
import react from '@astrojs/react';
import solid from '@astrojs/solid-js';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

export default defineConfig({
	integrations: [
		preact({ include: ['**/preact/*'] }),
		solid({ include: ['**/solid/*'] }),
		react({ include: ['**/react/*'] }),
		svelte(),
		vue()
	]
});

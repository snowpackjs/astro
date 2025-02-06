import react from '@astrojs/react';
import solid from '@astrojs/solid-js';
import { defineConfig } from 'astro/config';

export default defineConfig({
	integrations: [react(), solid()]
});

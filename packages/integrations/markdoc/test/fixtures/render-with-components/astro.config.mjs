import markdoc from '@astrojs/markdoc';
import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [markdoc(), preact()],
});

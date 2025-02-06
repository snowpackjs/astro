import markdoc from '@astrojs/markdoc';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [markdoc({ ignoreIndentation: true })],
});

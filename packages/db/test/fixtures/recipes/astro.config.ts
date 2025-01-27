import astroDb from '@astrojs/db';
import { defineConfig } from 'astro/config';

export default defineConfig({
	integrations: [astroDb()],
});

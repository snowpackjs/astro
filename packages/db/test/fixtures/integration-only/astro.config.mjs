import db from '@astrojs/db';
import { defineConfig } from 'astro/config';
import testIntegration from './integration';

// https://astro.build/config
export default defineConfig({
	integrations: [db(), testIntegration()],
});

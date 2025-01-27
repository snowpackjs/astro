import { defineConfig } from 'astro/config';
import integration from './integration.mjs';

// https://astro.build/config
export default defineConfig({
	integrations: [integration()]
});

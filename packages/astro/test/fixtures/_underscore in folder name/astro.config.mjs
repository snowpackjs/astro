import { defineConfig } from 'astro/config';
import fakeIntegration from 'fake-astro-library';

export default defineConfig({
	integrations: [
		fakeIntegration(),
	],
});

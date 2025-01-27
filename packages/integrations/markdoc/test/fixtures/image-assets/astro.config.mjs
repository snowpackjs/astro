import markdoc from '@astrojs/markdoc';
import { defineConfig } from 'astro/config';
import { testImageService } from '../../../../../astro/test/test-image-service.js';

// https://astro.build/config
export default defineConfig({
	image: {
		service: testImageService(),
	},
	integrations: [markdoc()],
});

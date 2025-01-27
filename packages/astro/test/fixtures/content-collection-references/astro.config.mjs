import { defineConfig } from 'astro/config';
import { testImageService } from '../../test-image-service.js';

// https://astro.build/config
export default defineConfig({
	image: {
		service: testImageService(),
	},
});

import mdx from '@astrojs/mdx';
import { testImageService } from '../../../../../astro/test/test-image-service.js';
import { defineConfig } from 'astro/config';

export default defineConfig({
	integrations: [mdx()],
	image: {
		service: testImageService(),
	},
	experimental: {
		responsiveImages: true,
	}
})

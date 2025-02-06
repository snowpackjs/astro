import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';
import { testImageService } from '../../test-image-service.js';

export default defineConfig({
	adapter: vercel({ imageService: true }),
	image: {
		service: testImageService(),
		domains: ['astro.build'],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**.amazonaws.com',
			},
		],
	},
});

import netlify from '@astrojs/netlify';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: netlify({
		edgeMiddleware: true,
	}),
	image: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				pathname: '/photo-1567674867291-b2595ac53ab4',
			},
		],
	},
});

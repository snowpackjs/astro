import markdoc from "@astrojs/markdoc";
import react from "@astrojs/react";
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [markdoc({
		nodes: process.env.ASTRO_PERFORMANCE_TEST_NAME === 'with-astro-components' ? {
			heading: {
				render: 'Heading',
				attributes: {
					level: { type: Number },
				},
			}
		} : {},
		tags: process.env.ASTRO_PERFORMANCE_TEST_NAME === 'with-astro-components' ? {
			aside: {
				render: 'Aside',
				attributes: {
					type: { type: String },
					title: { type: String },
				},
			}
		} : process.env.ASTRO_PERFORMANCE_TEST_NAME === 'with-react-components' ? {
			'like-button': {
				render: 'LikeButton',
				attributes: {
					liked: { type: Boolean },
				},
			},
			'hydrated-like-button': {
				render: 'HydratedLikeButton',
				attributes: {
					liked: { type: Boolean },
				},
			},
		} : {},
	}), react()],
});

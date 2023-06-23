import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
	tags: {
		aside: {
			render: component('./src/components/Aside.astro', import.meta.url),
			attributes: {
				type: { type: String },
				title: { type: String },
			},
		},
		authorName: {
			render: component('./src/components/AuthorName.astro', import.meta.url),
			attributes: {
				slug: { type: String },
			},
		},
	},
});

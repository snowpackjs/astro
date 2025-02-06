import { component, defineMarkdocConfig } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
	tags: {
		aside: {
			render: component('./src/components/Aside.astro'),
			attributes: {
				type: { type: String },
				title: { type: String },
			},
		},
		mark: {
			render: component('./src/components/Mark.astro'),
			attributes: {
				color: { type: String },
			},
		},
	},
})

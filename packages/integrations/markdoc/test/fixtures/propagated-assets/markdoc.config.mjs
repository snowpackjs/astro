import { component, defineMarkdocConfig } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
	tags: {
		aside: {
			render: component('./src/components/Aside.astro'),
			attributes: {
				type: { type: String },
				title: { type: String },
			}
		},
		logHello: {
			render: component('./src/components/LogHello.astro'),
		}
	},
})

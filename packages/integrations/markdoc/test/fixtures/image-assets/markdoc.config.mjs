import { component, defineMarkdocConfig, nodes } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
	tags: {
		image: {
			attributes: nodes.image.attributes,
			render: component('./src/components/Image.astro'),
		},
	},
});

import { defineMarkdocConfig, nodes, component } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
	nodes: {
		document: {
			...nodes.document,
			render: null,
		},
	},
	tags: {
		'div-wrapper': {
			render: component('./src/components/DivWrapper.astro'),
		},
	},
});

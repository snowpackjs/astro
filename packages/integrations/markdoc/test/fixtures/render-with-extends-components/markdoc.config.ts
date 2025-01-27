import { component, defineMarkdocConfig } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
	extends: [preset()],
});

function preset() {
	return {
		nodes: {
			fence: {
				render: component('./src/components/Code.astro'),
				attributes: {
					language: { type: String },
					content: { type: String },
				},
			},
		},
		tags: {
			'marquee-element': {
				render: component('./src/components/CustomMarquee.astro'),
				attributes: {
					direction: {
						type: String,
						default: 'left',
						matches: ['left', 'right', 'up', 'down'],
					},
				},
			},
		},
	}
}

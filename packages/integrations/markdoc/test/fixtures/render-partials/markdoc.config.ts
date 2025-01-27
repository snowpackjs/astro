import { Markdoc, defineMarkdocConfig } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
	partials: {
		configured: Markdoc.parse('# Configured partial {% #configured %}'),
	},
});

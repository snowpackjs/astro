import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

// API Reference: https://docs.astro.build/en/reference/integrations-reference/
export default {
	name: 'my-astro-integration',
	hooks: {
		'astro:config:setup': ({ addDevToolbarApp }) => {
			addDevToolbarApp({
				id: "my-toolbar-app",
				name: "My Toolbar App",
				icon: "🚀",
				entrypoint: fileURLToPath(new URL('./app.js', import.meta.url))
			});
		},
	},
} satisfies AstroIntegration;

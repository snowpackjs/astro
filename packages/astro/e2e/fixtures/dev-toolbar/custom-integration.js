import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {() => import('astro').AstroIntegration} */
export function myIntegration() {
	return {
		name: 'my-integration',
		hooks: {
			'astro:config:setup': ({ addDevToolbarApp }) => {
				const importPath = dirname(fileURLToPath(import.meta.url));
				const pluginPath = join(importPath, 'custom-plugin.js');

				addDevToolbarApp({
					id: 'my-plugin',
					name: 'My Plugin',
					icon: 'astro:logo',
					entrypoint: pluginPath
				});
			},
			'astro:server:setup': ({ toolbar }) => {
				toolbar.onAppInitialized("my-plugin", () => {
					toolbar.send("super-server-event", { message: "Hello from the server!" })
				});
			}
		},
	};
}

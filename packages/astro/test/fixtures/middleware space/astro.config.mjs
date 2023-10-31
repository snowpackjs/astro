import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	integrations: [
		{
			name: 'my-middleware',
			hooks: {
				'astro:config:setup':({ addMiddleware }) => {
					addMiddleware({
						entrypoint: fileURLToPath(new URL('./integration-middleware-pre.js', import.meta.url)),
						order: 'pre'
					});

					addMiddleware({
						entrypoint: fileURLToPath(new URL('./integration-middleware-post.js', import.meta.url)),
						order: 'post'
					});
				}
			}
		}
	]
});

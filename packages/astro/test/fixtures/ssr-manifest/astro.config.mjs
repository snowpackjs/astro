import { defineConfig } from 'astro/config';
import testAdapter from '../../test-adapter.js';
import { fileURLToPath } from 'url';

export default defineConfig({
	output: 'server',
	adapter: testAdapter(),
	integrations: [
		{
			name: 'test',
			hooks: {
				'astro:config:setup'({ injectRoute }) {
					injectRoute({
						entrypoint: fileURLToPath(new URL('./entrypoint-test.js', import.meta.url)),
						pattern: '[...slug]',
						prerender: true,
					});
				},
			},
		},
	],
});

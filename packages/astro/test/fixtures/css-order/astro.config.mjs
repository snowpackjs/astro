import { defineConfig } from 'astro/config';

export default defineConfig({
	integrations: [
		{
			name: 'test-integration',
			hooks: {
				'astro:config:setup'({ injectScript }) {
					injectScript('page-ssr', `import '/src/styles/base.css';`);
				}
			}
		}
	]
});

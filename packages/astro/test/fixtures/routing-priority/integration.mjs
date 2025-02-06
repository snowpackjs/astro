export default function() {
	return {
		name: '@astrojs/test-integration',
			hooks: {
				'astro:config:setup': ({ injectRoute }) => {
					injectRoute({
						pattern: '/injected',
						entrypoint: './src/to-inject.astro'
					});
					injectRoute({
						pattern: '/_injected',
						entrypoint: './src/_to-inject.astro'
					});
					injectRoute({
						pattern: '/[id]',
						entrypoint: './src/[id].astro'
					});
				}
			}
	}
}

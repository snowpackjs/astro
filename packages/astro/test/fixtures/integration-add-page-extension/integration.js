export default function() {
	return {
		name: '@astrojs/test-integration',
		hooks: {
			'astro:config:setup': ({ addPageExtension }) => {
				addPageExtension('.mjs')
			}
		}
	}
}

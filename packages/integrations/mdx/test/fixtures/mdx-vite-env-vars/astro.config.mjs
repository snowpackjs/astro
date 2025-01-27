import mdx from '@astrojs/mdx';

export default {
	site: 'https://mdx-is-neat.com/',
	markdown: {
		syntaxHighlight: false,
	},
	integrations: [mdx()],
	vite: {
		build: {
			// Enabling sourcemap may crash the build when using `import.meta.env.UNKNOWN_VAR`
			// https://github.com/withastro/astro/issues/9012
			sourcemap: true,
		},
	},
}

export default {
	markdownOptions: {
		render: ['@astrojs/markdown-remark', { syntaxHighlight: 'shiki', shikiConfig: { wrap: null } }],
	},
}

import mdx from '@astrojs/mdx';

export default {
	integrations: [
		mdx({
			optimize: {
				ignoreElementNames: ['strong'],
			},
		}),
	],
	markdown: {
		rehypePlugins: [
			() => {
				return (tree) => {
					tree.children.push({
						type: 'root',
						children: [
							{
								type: 'element',
								tagName: 'p',
								properties: {
									id: 'injected-root-hast',
								},
								children: [
									{
										type: 'text',
										value: 'Injected root hast from rehype plugin',
									},
								],
							},
						],
					});
				};
			},
		],
	},
};

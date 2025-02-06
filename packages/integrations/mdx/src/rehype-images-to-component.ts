import type { Properties, Root } from 'hast';
import type { MdxJsxAttribute, MdxjsEsm } from 'mdast-util-mdx';
import type { MdxJsxFlowElementHast } from 'mdast-util-mdx-jsx';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';
import { jsToTreeNode } from './utils.js';

export const ASTRO_IMAGE_ELEMENT = 'astro-image';
export const ASTRO_IMAGE_IMPORT = '__AstroImage__';
export const USES_ASTRO_IMAGE_FLAG = '__usesAstroImage';

function createArrayAttribute(name: string, values: (string | number)[]): MdxJsxAttribute {
	return {
		type: 'mdxJsxAttribute',
		name: name,
		value: {
			type: 'mdxJsxAttributeValueExpression',
			value: name,
			data: {
				estree: {
					type: 'Program',
					body: [
						{
							type: 'ExpressionStatement',
							expression: {
								type: 'ArrayExpression',
								elements: values.map((value) => ({
									type: 'Literal',
									value: value,
									raw: String(value),
								})),
							},
						},
					],
					sourceType: 'module',
					comments: [],
				},
			},
		},
	};
}

/**
 * Convert the <img /> element properties (except `src`) to MDX JSX attributes.
 *
 * @param {Properties} props - The element properties
 * @returns {MdxJsxAttribute[]} The MDX attributes
 */
function getImageComponentAttributes(props: Properties): MdxJsxAttribute[] {
	const attrs: MdxJsxAttribute[] = [];

	for (const [prop, value] of Object.entries(props)) {
		if (prop === 'src') continue;

		/*
		 * <Image /> component expects an array for those attributes but the
		 * received properties are sanitized as strings. So we need to convert them
		 * back to an array.
		 */
		if (prop === 'widths' || prop === 'densities') {
			attrs.push(createArrayAttribute(prop, String(value).split(' ')));
		} else {
			attrs.push({
				name: prop,
				type: 'mdxJsxAttribute',
				value: String(value),
			});
		}
	}

	return attrs;
}

export function rehypeImageToComponent() {
	return function (tree: Root, file: VFile) {
		if (!file.data.astro?.imagePaths?.length) return;
		const importsStatements: MdxjsEsm[] = [];
		const importedImages = new Map<string, string>();

		visit(tree, 'element', (node, index, parent) => {
			if (!file.data.astro?.imagePaths?.length || node.tagName !== 'img' || !node.properties.src)
				return;

			const src = decodeURI(String(node.properties.src));

			if (!file.data.astro.imagePaths?.includes(src)) return;

			let importName = importedImages.get(src);

			if (!importName) {
				importName = `__${importedImages.size}_${src.replace(/\W/g, '_')}__`;

				importsStatements.push({
					type: 'mdxjsEsm',
					value: '',
					data: {
						estree: {
							type: 'Program',
							sourceType: 'module',
							body: [
								{
									type: 'ImportDeclaration',
									source: {
										type: 'Literal',
										value: src,
										raw: JSON.stringify(src),
									},
									specifiers: [
										{
											type: 'ImportDefaultSpecifier',
											local: { type: 'Identifier', name: importName },
										},
									],
								},
							],
						},
					},
				});
				importedImages.set(src, importName);
			}

			// Build a component that's equivalent to <Image src={importName} {...attributes} />
			const componentElement: MdxJsxFlowElementHast = {
				name: ASTRO_IMAGE_ELEMENT,
				type: 'mdxJsxFlowElement',
				attributes: [
					...getImageComponentAttributes(node.properties),
					{
						name: 'src',
						type: 'mdxJsxAttribute',
						value: {
							type: 'mdxJsxAttributeValueExpression',
							value: importName,
							data: {
								estree: {
									type: 'Program',
									sourceType: 'module',
									comments: [],
									body: [
										{
											type: 'ExpressionStatement',
											expression: { type: 'Identifier', name: importName },
										},
									],
								},
							},
						},
					},
				],
				children: [],
			};

			parent!.children.splice(index!, 1, componentElement);
		});

		// Add all the import statements to the top of the file for the images
		tree.children.unshift(...importsStatements);

		tree.children.unshift(
			jsToTreeNode(`import { Image as ${ASTRO_IMAGE_IMPORT} } from "astro:assets";`),
		);
		// Export `__usesAstroImage` to pick up `astro:assets` usage in the module graph.
		// @see the '@astrojs/mdx-postprocess' plugin
		tree.children.push(jsToTreeNode(`export const ${USES_ASTRO_IMAGE_FLAG} = true`));
	};
}

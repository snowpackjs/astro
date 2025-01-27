import { visit } from 'unist-util-visit';

/**
 * Moves `data.meta` to `properties.metastring` for the `code` element node
 * as `rehype-raw` strips `data` from all nodes, which may contain useful information.
 * e.g. ```js {1:3} => metastring: "{1:3}"
 */
export default function rehypeMetaString() {
	return function (tree: any) {
		visit(tree, (node) => {
			if (node.type === 'element' && node.tagName === 'code' && node.data?.meta) {
				node.properties ??= {};
				node.properties.metastring = node.data.meta;
			}
		});
	};
}

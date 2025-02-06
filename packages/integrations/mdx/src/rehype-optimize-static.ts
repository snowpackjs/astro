import type { RehypePlugin } from '@astrojs/markdown-remark';
import { SKIP, visit } from 'estree-util-visit';
import type { Element, RootContent, RootContentMap } from 'hast';
import { toHtml } from 'hast-util-to-html';
import type { MdxJsxFlowElementHast, MdxJsxTextElementHast } from 'mdast-util-mdx-jsx';

// This import includes ambient types for hast to include mdx nodes
import type {} from 'mdast-util-mdx';

// Alias as the main hast node
type Node = RootContent;
// Nodes that have the `children` property
type ParentNode = Element | MdxJsxFlowElementHast | MdxJsxTextElementHast;
// Nodes that can have its children optimized as a single HTML string
type OptimizableNode = Element | MdxJsxFlowElementHast | MdxJsxTextElementHast;

export interface OptimizeOptions {
	ignoreElementNames?: string[];
}

interface ElementMetadata {
	parent: ParentNode;
	index: number;
}

const exportConstComponentsRe = /export\s+const\s+components\s*=/;

/**
 * For MDX only, collapse static subtrees of the hast into `set:html`. Subtrees
 * do not include any MDX elements.
 *
 * This optimization reduces the JS output as more content are represented as a
 * string instead, which also reduces the AST size that Rollup holds in memory.
 */
export const rehypeOptimizeStatic: RehypePlugin<[OptimizeOptions?]> = (options) => {
	return (tree) => {
		// A set of non-static components to avoid collapsing when walking the tree
		// as they need to be preserved as JSX to be rendered dynamically.
		const ignoreElementNames = new Set<string>(options?.ignoreElementNames);

		// Find `export const components = { ... }` and get it's object's keys to be
		// populated into `ignoreElementNames`. This configuration is used to render
		// some HTML elements as custom components, and we also want to avoid collapsing them.
		for (const child of tree.children) {
			if (child.type === 'mdxjsEsm' && exportConstComponentsRe.test(child.value)) {
				const keys = getExportConstComponentObjectKeys(child);
				if (keys) {
					for (const key of keys) {
						ignoreElementNames.add(key);
					}
				}
				break;
			}
		}

		// All possible elements that could be the root of a subtree
		const allPossibleElements = new Set<OptimizableNode>();
		// The current collapsible element stack while traversing the tree
		const elementStack: Node[] = [];
		// Metadata used by `findElementGroups` later
		const elementMetadatas = new WeakMap<OptimizableNode, ElementMetadata>();

		/**
		 * A non-static node causes all its parents to be non-optimizable
		 */
		const isNodeNonStatic = (node: Node) => {
			return (
				node.type.startsWith('mdx') ||
				// @ts-expect-error `node` should never have `type: 'root'`, but in some cases plugins may inject it as children,
				// which MDX will render as a fragment instead (an MDX fragment is a `mdxJsxFlowElement` type).
				node.type === 'root' ||
				// @ts-expect-error Access `.tagName` naively for perf
				ignoreElementNames.has(node.tagName)
			);
		};

		visit(tree as any, {
			// @ts-expect-error Force coerce node as hast node
			enter(node: Node, key, index, parents: ParentNode[]) {
				// `estree-util-visit` may traverse in MDX `attributes`, we don't want that. Only continue
				// if it's traversing the root, or the `children` key.
				if (key != null && key !== 'children') return SKIP;

				// Mutate `node` as a normal hast element node if it's a plain MDX node, e.g. `<kbd>something</kbd>`
				simplifyPlainMdxComponentNode(node, ignoreElementNames);

				// For nodes that are not static, eliminate all elements in the `elementStack` from the
				// `allPossibleElements` set.
				if (isNodeNonStatic(node)) {
					for (const el of elementStack) {
						allPossibleElements.delete(el as OptimizableNode);
					}
					// Micro-optimization: While this destroys the meaning of an element
					// stack for this node, things will still work but we won't repeatedly
					// run the above for other nodes anymore. If this is confusing, you can
					// comment out the code below when reading.
					elementStack.length = 0;
				}
				// For possible subtree root nodes, record them in `elementStack` and
				// `allPossibleElements` to be used in the "leave" hook below.
				if (node.type === 'element' || isMdxComponentNode(node)) {
					elementStack.push(node);
					allPossibleElements.add(node);

					if (index != null && node.type === 'element') {
						// Record metadata for element node to be used for grouping analysis later
						elementMetadatas.set(node, { parent: parents[parents.length - 1], index });
					}
				}
			},
			// @ts-expect-error Force coerce node as hast node
			leave(node: Node, key, _, parents: ParentNode[]) {
				// `estree-util-visit` may traverse in MDX `attributes`, we don't want that. Only continue
				// if it's traversing the root, or the `children` key.
				if (key != null && key !== 'children') return SKIP;

				// Do the reverse of the if condition above, popping the `elementStack`,
				// and consolidating `allPossibleElements` as a subtree root.
				if (node.type === 'element' || isMdxComponentNode(node)) {
					elementStack.pop();
					// Many possible elements could be part of a subtree, in order to find
					// the root, we check the parent of the element we're popping. If the
					// parent exists in `allPossibleElements`, then we're definitely not
					// the root, so remove ourselves. This will work retroactively as we
					// climb back up the tree.
					const parent = parents[parents.length - 1];
					if (allPossibleElements.has(parent)) {
						allPossibleElements.delete(node);
					}
				}
			},
		});

		// Within `allPossibleElements`, element nodes are often siblings and instead of setting `set:html`
		// on each of the element node, we can create a `<Fragment set:html="...">` element that includes
		// all element nodes instead, simplifying the output.
		const elementGroups = findElementGroups(allPossibleElements, elementMetadatas, isNodeNonStatic);

		// For all possible subtree roots, collapse them into `set:html` and
		// strip of their children
		for (const el of allPossibleElements) {
			// Avoid adding empty `set:html` attributes if there's no children
			if (el.children.length === 0) continue;

			if (isMdxComponentNode(el)) {
				el.attributes.push({
					type: 'mdxJsxAttribute',
					name: 'set:html',
					value: toHtml(el.children),
				});
			} else {
				el.properties['set:html'] = toHtml(el.children);
			}
			el.children = [];
		}

		// For each element group, we create a new `<Fragment />` MDX node with `set:html` of the children
		// serialized as HTML. We insert this new fragment, replacing all the group children nodes.
		// We iterate in reverse to avoid changing the index of groups of the same parent.
		for (let i = elementGroups.length - 1; i >= 0; i--) {
			const group = elementGroups[i];
			const fragmentNode: MdxJsxFlowElementHast = {
				type: 'mdxJsxFlowElement',
				name: 'Fragment',
				attributes: [
					{
						type: 'mdxJsxAttribute',
						name: 'set:html',
						value: toHtml(group.children),
					},
				],
				children: [],
			};
			group.parent.children.splice(group.startIndex, group.children.length, fragmentNode);
		}
	};
};

interface ElementGroup {
	parent: ParentNode;
	startIndex: number;
	children: Node[];
}

/**
 * Iterate through `allPossibleElements` and find elements that are siblings, and return them. `allPossibleElements`
 * will be mutated to exclude these grouped elements.
 */
function findElementGroups(
	allPossibleElements: Set<OptimizableNode>,
	elementMetadatas: WeakMap<OptimizableNode, ElementMetadata>,
	isNodeNonStatic: (node: Node) => boolean,
): ElementGroup[] {
	const elementGroups: ElementGroup[] = [];

	for (const el of allPossibleElements) {
		// Non-static nodes can't be grouped. It can only optimize its static children.
		if (isNodeNonStatic(el)) continue;

		// Get the metadata for the element node, this should always exist
		const metadata = elementMetadatas.get(el);
		if (!metadata) {
			throw new Error(
				'Internal MDX error: rehype-optimize-static should have metadata for element node',
			);
		}

		// For this element, iterate through the next siblings and add them to this array
		// if they are text nodes or elements that are in `allPossibleElements` (optimizable).
		// If one of the next siblings don't match the criteria, break the loop as others are no longer siblings.
		const groupableElements: Node[] = [el];
		for (let i = metadata.index + 1; i < metadata.parent.children.length; i++) {
			const node = metadata.parent.children[i];

			// If the node is non-static, we can't group it with the current element
			if (isNodeNonStatic(node)) break;

			if (node.type === 'element') {
				// This node is now (presumably) part of a group, remove it from `allPossibleElements`
				const existed = allPossibleElements.delete(node);
				// If this node didn't exist in `allPossibleElements`, it's likely that one of its children
				// are non-static, hence this node can also not be grouped. So we break out here.
				if (!existed) break;
			}

			groupableElements.push(node);
		}

		// If group elements are more than one, add them to the `elementGroups`.
		// Grouping is most effective if there's multiple elements in it.
		if (groupableElements.length > 1) {
			elementGroups.push({
				parent: metadata.parent,
				startIndex: metadata.index,
				children: groupableElements,
			});
			// The `el` is also now part of a group, remove it from `allPossibleElements`
			allPossibleElements.delete(el);
		}
	}

	return elementGroups;
}

function isMdxComponentNode(node: Node): node is MdxJsxFlowElementHast | MdxJsxTextElementHast {
	return node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';
}

/**
 * Get the object keys from `export const components`
 *
 * @example
 * `export const components = { foo, bar: Baz }`, returns `['foo', 'bar']`
 */
function getExportConstComponentObjectKeys(node: RootContentMap['mdxjsEsm']) {
	const exportNamedDeclaration = node.data?.estree?.body[0];
	if (exportNamedDeclaration?.type !== 'ExportNamedDeclaration') return;

	const variableDeclaration = exportNamedDeclaration.declaration;
	if (variableDeclaration?.type !== 'VariableDeclaration') return;

	const variableInit = variableDeclaration.declarations[0]?.init;
	if (variableInit?.type !== 'ObjectExpression') return;

	const keys: string[] = [];
	for (const propertyNode of variableInit.properties) {
		if (propertyNode.type === 'Property' && propertyNode.key.type === 'Identifier') {
			keys.push(propertyNode.key.name);
		}
	}
	return keys;
}

/**
 * Some MDX nodes are simply `<kbd>something</kbd>` which isn't needed to be completely treated
 * as an MDX node. This function tries to mutate this node as a simple hast element node if so.
 */
function simplifyPlainMdxComponentNode(node: Node, ignoreElementNames: Set<string>) {
	if (
		!isMdxComponentNode(node) ||
		// Attributes could be dynamic, so bail if so.
		node.attributes.length > 0 ||
		// Fragments are also dynamic
		!node.name ||
		// Ignore if the node name is in the ignore list
		ignoreElementNames.has(node.name) ||
		// If the node name has uppercase characters, it's likely an actual MDX component
		node.name.toLowerCase() !== node.name
	) {
		return;
	}

	// Mutate as hast element node
	const newNode = node as unknown as Element;
	newNode.type = 'element';
	newNode.tagName = node.name;
	newNode.properties = {};

	// @ts-expect-error Delete mdx-specific properties
	node.attributes = undefined;
	node.data = undefined;
}

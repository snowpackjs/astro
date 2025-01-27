import type { Element, Parent, Root } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import { toText } from 'hast-util-to-text';
import { removePosition } from 'unist-util-remove-position';
import { visitParents } from 'unist-util-visit-parents';

type Highlighter = (
	code: string,
	language: string,
	options?: { meta?: string },
) => Promise<Root | string>;

const languagePattern = /\blanguage-(\S+)\b/;

/**
 * A hast utility to syntax highlight code blocks with a given syntax highlighter.
 *
 * @param tree
 *   The hast tree in which to syntax highlight code blocks.
 * @param highlighter
 *   A function which receives the code and language, and returns the HTML of a syntax
 *   highlighted `<pre>` element.
 */
export async function highlightCodeBlocks(tree: Root, highlighter: Highlighter) {
	const nodes: Array<{
		node: Element;
		language: string;
		parent: Element;
		grandParent: Parent;
	}> = [];

	// We’re looking for `<code>` elements
	visitParents(tree, { type: 'element', tagName: 'code' }, (node, ancestors) => {
		const parent = ancestors.at(-1);

		// Whose parent is a `<pre>`.
		if (parent?.type !== 'element' || parent.tagName !== 'pre') {
			return;
		}

		// Where the `<code>` is the only child.
		if (parent.children.length !== 1) {
			return;
		}

		// And the `<code>` has a class name that starts with `language-`.
		let languageMatch: RegExpMatchArray | null | undefined;
		let { className } = node.properties;
		if (typeof className === 'string') {
			languageMatch = languagePattern.exec(className);
		} else if (Array.isArray(className)) {
			for (const cls of className) {
				if (typeof cls !== 'string') {
					continue;
				}

				languageMatch = languagePattern.exec(cls);
				if (languageMatch) {
					break;
				}
			}
		}

		// Don’t mighlight math code blocks.
		if (languageMatch?.[1] === 'math') {
			return;
		}

		nodes.push({
			node,
			language: languageMatch?.[1] || 'plaintext',
			parent,
			grandParent: ancestors.at(-2)!,
		});
	});

	for (const { node, language, grandParent, parent } of nodes) {
		const meta = (node.data as any)?.meta ?? node.properties.metastring ?? undefined;
		const code = toText(node, { whitespace: 'pre' });
		const result = await highlighter(code, language, { meta });

		let replacement: Element;
		if (typeof result === 'string') {
			// The replacement returns a root node with 1 child, the `<pre>` element replacement.
			replacement = fromHtml(result, { fragment: true }).children[0] as Element;
			// We just generated this node, so any positional information is invalid.
			removePosition(replacement);
		} else {
			replacement = result.children[0] as Element;
		}

		// We replace the parent in its parent with the new `<pre>` element.
		const index = grandParent.children.indexOf(parent);
		grandParent.children[index] = replacement;
	}
}

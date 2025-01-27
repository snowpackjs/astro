import type { Expression, Super } from 'estree';
import Slugger from 'github-slugger';
import type { MdxTextExpression } from 'mdast-util-mdx-expression';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';
import type { MarkdownHeading, RehypePlugin } from './types.js';

const rawNodeTypes = new Set(['text', 'raw', 'mdxTextExpression']);
const codeTagNames = new Set(['code', 'pre']);

export function rehypeHeadingIds(): ReturnType<RehypePlugin> {
	return function (tree, file) {
		const headings: MarkdownHeading[] = [];
		const frontmatter = file.data.astro?.frontmatter;
		const slugger = new Slugger();
		const isMDX = isMDXFile(file);
		visit(tree, (node) => {
			if (node.type !== 'element') return;
			const { tagName } = node;
			if (tagName[0] !== 'h') return;
			const [, level] = /h([0-6])/.exec(tagName) ?? [];
			if (!level) return;
			const depth = Number.parseInt(level);

			let text = '';
			visit(node, (child, __, parent) => {
				if (child.type === 'element' || parent == null) {
					return;
				}
				if (child.type === 'raw') {
					if (/^\n?<.*>\n?$/.test(child.value)) {
						return;
					}
				}
				if (rawNodeTypes.has(child.type)) {
					if (isMDX || codeTagNames.has(parent.tagName)) {
						let value = child.value;
						if (isMdxTextExpression(child) && frontmatter) {
							const frontmatterPath = getMdxFrontmatterVariablePath(child);
							if (Array.isArray(frontmatterPath) && frontmatterPath.length > 0) {
								const frontmatterValue = getMdxFrontmatterVariableValue(
									frontmatter,
									frontmatterPath,
								);
								if (typeof frontmatterValue === 'string') {
									value = frontmatterValue;
								}
							}
						}
						text += value;
					} else {
						text += child.value.replace(/\{/g, '${');
					}
				}
			});

			node.properties = node.properties || {};
			if (typeof node.properties.id !== 'string') {
				let slug = slugger.slug(text);

				if (slug.endsWith('-')) slug = slug.slice(0, -1);

				node.properties.id = slug;
			}

			headings.push({ depth, slug: node.properties.id, text });
		});

		file.data.astro ??= {};
		file.data.astro.headings = headings;
	};
}

function isMDXFile(file: VFile) {
	return Boolean(file.history[0]?.endsWith('.mdx'));
}

/**
 * Check if an ESTree entry is `frontmatter.*.VARIABLE`.
 * If it is, return the variable path (i.e. `["*", ..., "VARIABLE"]`) minus the `frontmatter` prefix.
 */
function getMdxFrontmatterVariablePath(node: MdxTextExpression): string[] | Error {
	if (!node.data?.estree || node.data.estree.body.length !== 1) return new Error();

	const statement = node.data.estree.body[0];

	// Check for "[ANYTHING].[ANYTHING]".
	if (statement?.type !== 'ExpressionStatement' || statement.expression.type !== 'MemberExpression')
		return new Error();

	let expression: Expression | Super = statement.expression;
	const expressionPath: string[] = [];

	// Traverse the expression, collecting the variable path.
	while (
		expression.type === 'MemberExpression' &&
		expression.property.type === (expression.computed ? 'Literal' : 'Identifier')
	) {
		expressionPath.push(
			expression.property.type === 'Literal'
				? String(expression.property.value)
				: expression.property.name,
		);

		expression = expression.object;
	}

	// Check for "frontmatter.[ANYTHING]".
	if (expression.type !== 'Identifier' || expression.name !== 'frontmatter') return new Error();

	return expressionPath.reverse();
}

function getMdxFrontmatterVariableValue(frontmatter: Record<string, any>, path: string[]) {
	let value = frontmatter;

	for (const key of path) {
		if (!value[key]) return undefined;

		value = value[key];
	}

	return value;
}

function isMdxTextExpression(node: Node): node is MdxTextExpression {
	return node.type === 'mdxTextExpression';
}

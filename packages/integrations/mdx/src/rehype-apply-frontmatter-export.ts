import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isFrontmatterValid } from '@astrojs/markdown-remark';
import type { Root, RootContent } from 'hast';
import type { VFile } from 'vfile';
import { jsToTreeNode } from './utils.js';

// Passed metadata to help determine adding charset utf8 by default
declare module 'vfile' {
	interface DataMap {
		applyFrontmatterExport?: {
			srcDir?: URL;
		};
	}
}

const exportConstPartialTrueRe = /export\s+const\s+partial\s*=\s*true/;

export function rehypeApplyFrontmatterExport() {
	return function (tree: Root, vfile: VFile) {
		const frontmatter = vfile.data.astro?.frontmatter;
		if (!frontmatter || !isFrontmatterValid(frontmatter))
			throw new Error(
				// Copied from Astro core `errors-data`
				// TODO: find way to import error data from core
				'[MDX] A remark or rehype plugin attempted to inject invalid frontmatter. Ensure "astro.frontmatter" is set to a valid JSON object that is not `null` or `undefined`.',
			);
		const extraChildren: RootContent[] = [
			jsToTreeNode(`export const frontmatter = ${JSON.stringify(frontmatter)};`),
		];
		if (frontmatter.layout) {
			extraChildren.unshift(
				jsToTreeNode(
					// NOTE: Use `__astro_*` import names to prevent conflicts with user code
					/** @see 'vite-plugin-markdown' for layout props reference */
					`\
import { jsx as __astro_layout_jsx__ } from 'astro/jsx-runtime';
import __astro_layout_component__ from ${JSON.stringify(frontmatter.layout)};

export default function ({ children }) {
	const { layout, ...content } = frontmatter;
	content.file = file;
	content.url = url;
	return __astro_layout_jsx__(__astro_layout_component__, {
		file,
		url,
		content,
		frontmatter: content,
		headings: getHeadings(),
		'server:root': true,
		children,
	});
};`,
				),
			);
		} else if (shouldAddCharset(tree, vfile)) {
			extraChildren.unshift({
				type: 'mdxJsxFlowElement',
				name: 'meta',
				attributes: [
					{
						type: 'mdxJsxAttribute',
						name: 'charset',
						value: 'utf-8',
					},
				],
				children: [],
			});
		}
		tree.children = extraChildren.concat(tree.children);
	};
}

/**
 * If this is a page (e.g. in src/pages), has no layout frontmatter (handled before calling this function),
 * has no leading component that looks like a wrapping layout, and `partial` isn't set to true, we default to
 * adding charset=utf-8 like markdown so that users don't have to worry about it for MDX pages without layouts.
 */
function shouldAddCharset(tree: Root, vfile: VFile) {
	const srcDirUrl = vfile.data.applyFrontmatterExport?.srcDir;
	if (!srcDirUrl) return false;

	const hasConstPartialTrue = tree.children.some(
		(node) => node.type === 'mdxjsEsm' && exportConstPartialTrueRe.test(node.value),
	);
	if (hasConstPartialTrue) return false;

	// NOTE: the pages directory is a non-configurable Astro behaviour
	const pagesDir = path.join(fileURLToPath(srcDirUrl), 'pages').replace(/\\/g, '/');
	// `vfile.path` comes from Vite, which is a normalized path (no backslashes)
	const filePath = vfile.path;
	if (!filePath.startsWith(pagesDir)) return false;

	const hasLeadingUnderscoreInPath = filePath
		.slice(pagesDir.length)
		.replace(/\\/g, '/')
		.split('/')
		.some((part) => part.startsWith('_'));
	if (hasLeadingUnderscoreInPath) return false;

	// Bail if the first content found is a wrapping layout component
	for (const child of tree.children) {
		if (child.type === 'element') break;
		if (child.type === 'mdxJsxFlowElement') {
			// If is fragment or lowercase tag name (html tags), skip and assume there's no layout
			if (child.name == null) break;
			if (child.name[0] === child.name[0].toLowerCase()) break;
			return false;
		}
	}

	return true;
}

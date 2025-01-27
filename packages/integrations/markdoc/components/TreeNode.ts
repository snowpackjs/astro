import type { RenderableTreeNodes } from '@markdoc/markdoc';
import Markdoc from '@markdoc/markdoc';
import type { AstroInstance, SSRResult } from 'astro';
import type { HTMLString } from 'astro/runtime/server/index.js';
import {
	createComponent,
	createHeadAndContent,
	isHTMLString,
	render,
	renderComponent,
	renderScriptElement,
	renderTemplate,
	renderUniqueStylesheet,
	unescapeHTML,
} from 'astro/runtime/server/index.js';

export type TreeNode =
	// Markdoc `if` tag often returns an array of nodes in the AST, which gets translated
	// here as an array of `TreeNode`s, which we'll render all without a wrapper.
	| TreeNode[]
	| {
			type: 'text';
			content: string | HTMLString;
	  }
	| {
			type: 'component';
			component: AstroInstance['default'];
			collectedLinks?: string[];
			collectedStyles?: string[];
			collectedScripts?: string[];
			props: Record<string, any>;
			children: TreeNode[];
	  }
	| {
			type: 'element';
			tag: string;
			attributes: Record<string, any>;
			children: TreeNode[];
	  };

function renderTreeNodeToFactoryResult(result: SSRResult, treeNode: TreeNode) {
	if (Array.isArray(treeNode)) {
		return Promise.all(
			treeNode.map((node) =>
				renderComponent(result, 'ComponentNode', ComponentNode, { treeNode: node }),
			),
		);
	}

	if (treeNode.type === 'text') return render`${treeNode.content}`;

	const slots = {
		default: () =>
			render`${treeNode.children.map((child) =>
				renderComponent(result, 'ComponentNode', ComponentNode, { treeNode: child }),
			)}`,
	};
	if (treeNode.type === 'component') {
		let styles = '',
			links = '',
			scripts = '';
		if (Array.isArray(treeNode.collectedStyles)) {
			styles = treeNode.collectedStyles
				.map((style: any) =>
					renderUniqueStylesheet(result, {
						type: 'inline',
						content: style,
					}),
				)
				.join('');
		}
		if (Array.isArray(treeNode.collectedLinks)) {
			links = treeNode.collectedLinks
				.map((link: any) => {
					return renderUniqueStylesheet(result, {
						type: 'external',
						src: link[0] === '/' ? link : '/' + link,
					});
				})
				.join('');
		}
		if (Array.isArray(treeNode.collectedScripts)) {
			scripts = treeNode.collectedScripts
				.map((script: any) => renderScriptElement(script))
				.join('');
		}

		const head = unescapeHTML(styles + links + scripts);

		let headAndContent = createHeadAndContent(
			head,
			renderTemplate`${renderComponent(
				result,
				treeNode.component.name,
				treeNode.component,
				treeNode.props,
				slots,
			)}`,
		);

		// Let the runtime know that this component is being used.
		// @ts-expect-error Astro only uses `init()` so specify it only (plus `_metadata` is internal)
		result._metadata.propagators.add({
			init() {
				return headAndContent;
			},
		});

		return headAndContent;
	}
	return renderComponent(result, treeNode.tag, treeNode.tag, treeNode.attributes, slots);
}

export const ComponentNode = createComponent({
	factory(result: SSRResult, { treeNode }: { treeNode: TreeNode | TreeNode[] }) {
		return renderTreeNodeToFactoryResult(result, treeNode);
	},
	propagation: 'self',
});

export async function createTreeNode(node: RenderableTreeNodes): Promise<TreeNode> {
	if (Array.isArray(node)) {
		return Promise.all(node.map((child) => createTreeNode(child)));
	} else if (isHTMLString(node)) {
		return { type: 'text', content: node as HTMLString };
	} else if (typeof node === 'string' || typeof node === 'number') {
		return { type: 'text', content: String(node) };
	} else if (node === null || typeof node !== 'object' || !Markdoc.Tag.isTag(node)) {
		return { type: 'text', content: '' };
	}

	const children = await Promise.all(node.children.map((child) => createTreeNode(child)));

	if (typeof node.name === 'function') {
		const component = node.name;
		const props = node.attributes;

		return {
			type: 'component',
			component,
			props,
			children,
		};
	} else if (isPropagatedAssetsModule(node.name)) {
		const { collectedStyles, collectedLinks, collectedScripts } = node.name;
		const component = (await node.name.getMod()).default;
		const props = node.attributes;

		return {
			type: 'component',
			component,
			collectedStyles,
			collectedLinks,
			collectedScripts,
			props,
			children,
		};
	} else {
		return {
			type: 'element',
			tag: node.name,
			attributes: node.attributes,
			children,
		};
	}
}

type PropagatedAssetsModule = {
	__astroPropagation: true;
	getMod: () => Promise<AstroInstance>;
	collectedStyles: string[];
	collectedLinks: string[];
	collectedScripts: string[];
};

function isPropagatedAssetsModule(module: any): module is PropagatedAssetsModule {
	return typeof module === 'object' && module != null && '__astroPropagation' in module;
}

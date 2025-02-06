import type { VFile } from 'vfile';
import { jsToTreeNode } from './utils.js';

export function rehypeInjectHeadingsExport() {
	return function (tree: any, file: VFile) {
		const headings = file.data.astro?.headings ?? [];
		tree.children.unshift(
			jsToTreeNode(`export function getHeadings() { return ${JSON.stringify(headings)} }`),
		);
	};
}

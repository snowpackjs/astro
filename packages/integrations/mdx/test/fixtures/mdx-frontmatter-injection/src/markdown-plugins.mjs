import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';
import { visit } from 'unist-util-visit';

export function rehypeReadingTime() {
	return function (tree, { data }) {
		const readingTime = getReadingTime(toString(tree));
		data.astro.frontmatter.injectedReadingTime = readingTime;
	};
}

export function remarkTitle() {
	return function (tree, { data }) {
		visit(tree, ['heading'], (node) => {
			if (node.depth === 1) {
				data.astro.frontmatter.title = toString(node.children);
			}
		});
	};
}

export function remarkDescription() {
	return function (tree, vfile) {
		const { frontmatter } = vfile.data.astro;
		frontmatter.description = `Processed by remarkDescription plugin: ${frontmatter.description}`
	};
}

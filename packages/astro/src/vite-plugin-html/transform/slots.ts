import type { Root, RootContent } from 'hast';
import type { Plugin } from 'unified';

import type MagicString from 'magic-string';
import { visit } from 'unist-util-visit';
import { escapeTemplateLiteralCharacters } from './utils.js';

const rehypeSlots: Plugin<[{ s: MagicString }], Root> = ({ s }) => {
	return (tree, file) => {
		visit(tree, (node: Root | RootContent) => {
			if (node.type === 'element' && node.tagName === 'slot') {
				if (typeof node.properties?.['is:inline'] !== 'undefined') return;
				const name = node.properties?.['name'] ?? 'default';
				const start = node.position?.start.offset ?? 0;
				const end = node.position?.end.offset ?? 0;
				const first = node.children.at(0) ?? node;
				const last = node.children.at(-1) ?? node;
				const text = file.value
					.slice(first.position?.start.offset ?? 0, last.position?.end.offset ?? 0)
					.toString();
				s.overwrite(
					start,
					end,
					`\${${SLOT_PREFIX}["${name}"] ?? \`${escapeTemplateLiteralCharacters(text).trim()}\`}`,
				);
			}
		});
	};
};

export default rehypeSlots;

export const SLOT_PREFIX = `___SLOTS___`;

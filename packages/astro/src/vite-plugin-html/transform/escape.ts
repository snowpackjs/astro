import type { Root, RootContent } from 'hast';
import type MagicString from 'magic-string';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { escapeTemplateLiteralCharacters, needsEscape, replaceAttribute } from './utils.js';

const rehypeEscape: Plugin<[{ s: MagicString }], Root> = ({ s }) => {
	return (tree) => {
		visit(tree, (node: Root | RootContent) => {
			if (node.type === 'text' || node.type === 'comment') {
				if (needsEscape(node.value)) {
					s.overwrite(
						node.position!.start.offset!,
						node.position!.end.offset!,
						escapeTemplateLiteralCharacters(node.value),
					);
				}
			} else if (node.type === 'element') {
				if (!node.properties) return;
				for (let [key, value] of Object.entries(node.properties)) {
					key = key.replace(/([A-Z])/g, '-$1').toLowerCase();
					const newKey = needsEscape(key) ? escapeTemplateLiteralCharacters(key) : key;
					const newValue = needsEscape(value) ? escapeTemplateLiteralCharacters(value) : value;
					if (newKey === key && newValue === value) continue;
					replaceAttribute(s, node, key, value === '' ? newKey : `${newKey}="${newValue}"`);
				}
			}
		});
	};
};

export default rehypeEscape;

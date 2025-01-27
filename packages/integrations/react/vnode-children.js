import { Fragment, createElement } from 'react';
import { DOCUMENT_NODE, ELEMENT_NODE, TEXT_NODE, parse } from 'ultrahtml';

let ids = 0;
export default function convert(children) {
	let doc = parse(children.toString().trim());
	let id = ids++;
	let key = 0;

	function createReactElementFromNode(node) {
		const childVnodes =
			Array.isArray(node.children) && node.children.length
				? node.children.map((child) => createReactElementFromNode(child)).filter(Boolean)
				: undefined;

		if (node.type === DOCUMENT_NODE) {
			return createElement(Fragment, {}, childVnodes);
		} else if (node.type === ELEMENT_NODE) {
			const { class: className, ...props } = node.attributes;
			return createElement(node.name, { ...props, className, key: `${id}-${key++}` }, childVnodes);
		} else if (node.type === TEXT_NODE) {
			// 0-length text gets omitted in JSX
			return node.value.trim() ? node.value : undefined;
		}
	}

	const root = createReactElementFromNode(doc);
	return root.props.children;
}

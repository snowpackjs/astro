import type { Config, Schema } from '@markdoc/markdoc';
import Markdoc from '@markdoc/markdoc';

const booleanAttributes = new Set([
	'allowfullscreen',
	'async',
	'autofocus',
	'autoplay',
	'checked',
	'controls',
	'default',
	'defer',
	'disabled',
	'disablepictureinpicture',
	'disableremoteplayback',
	'download',
	'formnovalidate',
	'hidden',
	'inert',
	'ismap',
	'itemscope',
	'loop',
	'multiple',
	'muted',
	'nomodule',
	'novalidate',
	'open',
	'playsinline',
	'readonly',
	'required',
	'reversed',
	'selected',
]);

// local
import { parseInlineCSSToReactLikeObject } from '../css/parse-inline-css-to-react.js';

// a Markdoc tag that will render a given HTML element and its attributes, as produced by the htmlTokenTransform function
export const htmlTag: Schema<Config, never> = {
	attributes: {
		name: { type: String, required: true },
		attrs: { type: Object },
	},

	transform(node, config) {
		const { name, attrs: unsafeAttributes } = node.attributes;
		const children = node.transformChildren(config);

		// pull out any "unsafe" attributes which need additional processing
		const { style, ...safeAttributes } = unsafeAttributes as Record<string, unknown>;

		// Convert boolean attributes to boolean literals
		for (const [key, value] of Object.entries(safeAttributes)) {
			if (booleanAttributes.has(key)) {
				// If the attribute exists, ensure its value is a boolean
				safeAttributes[key] = value === '' || value === true || value === 'true';
			}
		}

		// if the inline "style" attribute is present we need to parse the HTML into a react-like React.CSSProperties object
		if (typeof style === 'string') {
			const styleObject = parseInlineCSSToReactLikeObject(style);
			safeAttributes.style = styleObject;
		}

		// create a Markdoc Tag for the given HTML node with the HTML attributes and children
		return new Markdoc.Tag(name, safeAttributes, children);
	},
};

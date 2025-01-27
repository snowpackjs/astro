/**
 * https://github.com/sveltejs/svelte/blob/61e5e53eee82e895c1a5b4fd36efb87eafa1fc2d/LICENSE.md
 * @license MIT
 *
 * Copyright (c) 2016-23 [these people](https://github.com/sveltejs/svelte/graphs/contributors)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { ARIARoleDefinitionKey } from 'aria-query';
import { aria, roles } from 'aria-query';
// @ts-expect-error package does not provide types
import { AXObjectRoles, elementAXObjects } from 'axobject-query';
import type { AuditRuleWithSelector } from './index.js';

const WHITESPACE_REGEX = /\s+/;

const a11y_required_attributes = {
	a: ['href'],
	area: ['alt', 'aria-label', 'aria-labelledby'],
	// html-has-lang
	html: ['lang'],
	// iframe-has-title
	iframe: ['title'],
	img: ['alt'],
	object: ['title', 'aria-label', 'aria-labelledby'],
};

const MAYBE_INTERACTIVE = new Map([
	['a', 'href'],
	['input', 'type'],
	['audio', 'controls'],
	['img', 'usemap'],
	['object', 'usemap'],
	['video', 'controls'],
]);

const interactiveElements = [
	'button',
	'details',
	'embed',
	'iframe',
	'label',
	'select',
	'textarea',
	...MAYBE_INTERACTIVE.keys(),
];

const labellableElements = ['button', 'input', 'meter', 'output', 'progress', 'select', 'textarea'];

const aria_non_interactive_roles = [
	'alert',
	'alertdialog',
	'application',
	'article',
	'banner',
	'cell',
	'columnheader',
	'complementary',
	'contentinfo',
	'definition',
	'dialog',
	'directory',
	'document',
	'feed',
	'figure',
	'form',
	'group',
	'heading',
	'img',
	'list',
	'listitem',
	'log',
	'main',
	'marquee',
	'math',
	'menuitemradio',
	'navigation',
	'none',
	'note',
	'presentation',
	'region',
	'row',
	'rowgroup',
	'rowheader',
	'search',
	'status',
	'tabpanel',
	'term',
	'timer',
	'toolbar',
	'tooltip',
];

// These elements aren't interactive and aren't non-interactive. Their interaction changes based on the role assigned to them
// https://www.w3.org/TR/html-aria/#docconformance -> look at the table, specification for the `div` and `span` elements.
const roleless_elements = ['div', 'span'];

const a11y_required_content = [
	// anchor-has-content
	'a',
	// heading-has-content
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
];

const a11y_distracting_elements = ['blink', 'marquee'];

const a11y_implicit_semantics = new Map([
	['a', 'link'],
	['area', 'link'],
	['article', 'article'],
	['aside', 'complementary'],
	['body', 'document'],
	['button', 'button'],
	['datalist', 'listbox'],
	['dd', 'definition'],
	['dfn', 'term'],
	['dialog', 'dialog'],
	['details', 'group'],
	['dt', 'term'],
	['fieldset', 'group'],
	['figure', 'figure'],
	['form', 'form'],
	['h1', 'heading'],
	['h2', 'heading'],
	['h3', 'heading'],
	['h4', 'heading'],
	['h5', 'heading'],
	['h6', 'heading'],
	['hr', 'separator'],
	['img', 'img'],
	['li', 'listitem'],
	['link', 'link'],
	['main', 'main'],
	['menu', 'list'],
	['meter', 'progressbar'],
	['nav', 'navigation'],
	['ol', 'list'],
	['option', 'option'],
	['optgroup', 'group'],
	['output', 'status'],
	['progress', 'progressbar'],
	['section', 'region'],
	['summary', 'button'],
	['table', 'table'],
	['tbody', 'rowgroup'],
	['textarea', 'textbox'],
	['tfoot', 'rowgroup'],
	['thead', 'rowgroup'],
	['tr', 'row'],
	['ul', 'list'],
]);
const menuitem_type_to_implicit_role = new Map([
	['command', 'menuitem'],
	['checkbox', 'menuitemcheckbox'],
	['radio', 'menuitemradio'],
]);
const input_type_to_implicit_role = new Map([
	['button', 'button'],
	['image', 'button'],
	['reset', 'button'],
	['submit', 'button'],
	['checkbox', 'checkbox'],
	['radio', 'radio'],
	['range', 'slider'],
	['number', 'spinbutton'],
	['email', 'textbox'],
	['search', 'searchbox'],
	['tel', 'textbox'],
	['text', 'textbox'],
	['url', 'textbox'],
]);

// All the WAI-ARIA 1.2 attributes from https://www.w3.org/TR/wai-aria-1.2/#state_prop_def
const ariaAttributes = new Set(
	'activedescendant atomic autocomplete busy checked colcount colindex colspan controls current describedby details disabled dropeffect errormessage expanded flowto grabbed haspopup hidden invalid keyshortcuts label labelledby level live modal multiline multiselectable orientation owns placeholder posinset pressed readonly relevant required roledescription rowcount rowindex rowspan selected setsize sort valuemax valuemin valuenow valuetext'.split(
		' ',
	),
);

// All the WAI-ARIA 1.2 role attribute values from https://www.w3.org/TR/wai-aria-1.2/#role_definitions
const ariaRoles = new Set(
	'alert alertdialog application article banner blockquote button caption cell checkbox code columnheader combobox command complementary composite contentinfo definition deletion dialog directory document emphasis feed figure form generic grid gridcell group heading img input insertion landmark link list listbox listitem log main marquee math meter menu menubar menuitem menuitemcheckbox menuitemradio navigation none note option paragraph presentation progressbar radio radiogroup range region roletype row rowgroup rowheader scrollbar search searchbox section sectionhead select separator slider spinbutton status strong structure subscript superscript switch tab table tablist tabpanel term textbox time timer toolbar tooltip tree treegrid treeitem widget window'.split(
		' ',
	),
);

function isInteractive(element: Element): boolean {
	const attribute = MAYBE_INTERACTIVE.get(element.localName);
	if (attribute) {
		return element.hasAttribute(attribute);
	}

	return true;
}

export const a11y: AuditRuleWithSelector[] = [
	{
		code: 'a11y-accesskey',
		title: 'Avoid using `accesskey`',
		message:
			"The `accesskey` attribute can cause accessibility issues. The shortcuts can conflict with the browser's or operating system's shortcuts, and they are difficult for users to discover and use.",
		selector: '[accesskey]',
	},
	{
		code: 'a11y-aria-activedescendant-has-tabindex',
		title: 'Elements with attribute `aria-activedescendant` must be tabbable',
		message:
			'Element with the `aria-activedescendant` attribute must either have an inherent `tabindex` or declare `tabindex` as an attribute.',
		selector: '[aria-activedescendant]',
		match(element) {
			if (!(element as HTMLElement).tabIndex && !element.hasAttribute('tabindex')) return true;
		},
	},
	{
		code: 'a11y-aria-attributes',
		title: 'Element does not support ARIA roles.',
		message: 'Elements like `meta`, `html`, `script`, `style` do not support having ARIA roles.',
		selector: ':is(meta, html, script, style)[role]',
		match(element) {
			for (const attribute of element.attributes) {
				if (attribute.name.startsWith('aria-')) return true;
			}
		},
	},
	{
		code: 'a11y-autofocus',
		title: 'Avoid using `autofocus`',
		message:
			'The `autofocus` attribute can cause accessibility issues, as it can cause the focus to move around unexpectedly for screen reader users.',
		selector: '[autofocus]',
	},
	{
		code: 'a11y-distracting-elements',
		title: 'Distracting elements should not be used',
		message:
			'Elements that can be visually distracting like `<marquee>` or `<blink>` can cause accessibility issues for visually impaired users and should be avoided.',
		selector: `:is(${a11y_distracting_elements.join(',')})`,
	},
	{
		code: 'a11y-hidden',
		title: 'Certain DOM elements are useful for screen reader navigation and should not be hidden',
		message: (element) => `${element.localName} element should not be hidden.`,
		selector: '[aria-hidden]:is(h1,h2,h3,h4,h5,h6)',
	},
	{
		code: 'a11y-img-redundant-alt',
		title: 'Redundant text in alt attribute',
		message:
			'Screen readers already announce `img` elements as an image. There is no need to use words such as "image", "photo", and/or "picture".',
		selector: 'img[alt]:not([aria-hidden])',
		match: (img: HTMLImageElement) => /\b(?:image|picture|photo)\b/i.test(img.alt),
	},
	{
		code: 'a11y-incorrect-aria-attribute-type',
		title: 'Incorrect value for ARIA attribute.',
		message: '`aria-hidden` should only receive a boolean.',
		selector: '[aria-hidden]',
		match(element) {
			const value = element.getAttribute('aria-hidden');
			if (!value) return true;
			if (!['true', 'false'].includes(value)) return true;
		},
	},
	{
		code: 'a11y-invalid-href',
		title: 'Invalid `href` attribute',
		message: "`href` should not be empty, `'#'`, or `javascript:`.",
		selector: 'a[href]:is([href=""], [href="#"], [href^="javascript:" i])',
	},
	{
		code: 'a11y-invalid-label',
		title: '`label` element should have an associated control and a text content.',
		message:
			'The `label` element must be associated with a control either by using the `for` attribute or by containing a nested form element. Additionally, the `label` element must have text content.',
		selector: 'label',
		match(element: HTMLLabelElement) {
			// Label must be associated with a control, either using `for` or having a nested valid element
			const hasFor = element.hasAttribute('for');
			const nestedLabellableElement = element.querySelector(`${labellableElements.join(', ')}`);
			if (!hasFor && !nestedLabellableElement) return true;

			// Label must have text content, using innerText to ignore hidden text
			const innerText = element.innerText.trim();
			if (innerText === '') return true;
		},
	},
	{
		code: 'a11y-media-has-caption',
		title: 'Unmuted video elements should have captions',
		message:
			'Videos without captions can be difficult for deaf and hard-of-hearing users to follow along with. If the video does not need captions, add the `muted` attribute.',
		selector: 'video:not([muted])',
		match(element) {
			const tracks = element.querySelectorAll('track');
			if (!tracks.length) return true;

			const hasCaptionTrack = Array.from(tracks).some(
				(track) => track.getAttribute('kind') === 'captions',
			);

			return !hasCaptionTrack;
		},
	},
	{
		code: 'a11y-misplaced-scope',
		title: 'The `scope` attribute should only be used on `<th>` elements',
		message:
			'The `scope` attribute tells the browser and screen readers how to navigate tables. In HTML5, it should only be used on `<th>` elements.',
		selector: ':not(th)[scope]',
	},
	{
		code: 'a11y-missing-attribute',
		title: 'Required attributes missing.',
		description:
			'Some HTML elements require additional attributes for accessibility. For example, an `img` element requires an `alt` attribute, this attribute is used to describe the content of the image for screen readers.',
		message: (element) => {
			const requiredAttributes =
				a11y_required_attributes[element.localName as keyof typeof a11y_required_attributes];

			const missingAttributes = requiredAttributes.filter(
				(attribute) => !element.hasAttribute(attribute),
			);

			return `${
				element.localName
			} element is missing required attributes for accessibility: ${missingAttributes.join(', ')} `;
		},
		selector: Object.keys(a11y_required_attributes).join(','),
		match(element) {
			const requiredAttributes =
				a11y_required_attributes[element.localName as keyof typeof a11y_required_attributes];

			if (!requiredAttributes) return true;
			for (const attribute of requiredAttributes) {
				if (!element.hasAttribute(attribute)) return true;
			}

			return false;
		},
	},
	{
		code: 'a11y-missing-content',
		title: 'Missing content',
		message:
			'Headings and anchors must have an accessible name, which can come from: inner text, aria-label, aria-labelledby, an img with alt property, or an svg with a tag <title></title>.',
		selector: a11y_required_content.join(','),
		match(element: HTMLElement) {
			// innerText is used to ignore hidden text
			const innerText = element.innerText?.trim();
			if (innerText && innerText !== '') return false;

			// Check for aria-label
			const ariaLabel = element.getAttribute('aria-label')?.trim();
			if (ariaLabel && ariaLabel !== '') return false;

			// Check for valid aria-labelledby
			const ariaLabelledby = element.getAttribute('aria-labelledby')?.trim();
			if (ariaLabelledby) {
				const ids = ariaLabelledby.split(' ');
				for (const id of ids) {
					const referencedElement = document.getElementById(id);
					if (referencedElement && referencedElement.innerText.trim() !== '') return false;
				}
			}

			// Check for <img> with valid alt attribute
			const imgElements = element.querySelectorAll('img');
			for (const img of imgElements) {
				const altAttribute = img.getAttribute('alt');
				if (altAttribute && altAttribute.trim() !== '') return false;
			}

			// Check for <svg> with valid title
			const svgElements = element.querySelectorAll('svg');
			for (const svg of svgElements) {
				const titleText = svg.querySelector('title');
				if (titleText && titleText.textContent && titleText.textContent.trim() !== '') return false;
			}

			const inputElements = element.querySelectorAll('input');
			for (const input of inputElements) {
				// Check for alt attribute if input type is image
				if (input.type === 'image') {
					const altAttribute = input.getAttribute('alt');
					if (altAttribute && altAttribute.trim() !== '') return false;
				}

				// Check for aria-label
				const inputAriaLabel = input.getAttribute('aria-label')?.trim();
				if (inputAriaLabel && inputAriaLabel !== '') return false;

				// Check for aria-labelledby
				const inputAriaLabelledby = input.getAttribute('aria-labelledby')?.trim();
				if (inputAriaLabelledby) {
					const ids = inputAriaLabelledby.split(' ');
					for (const id of ids) {
						const referencedElement = document.getElementById(id);
						if (referencedElement && referencedElement.innerText.trim() !== '') return false;
					}
				}

				// Check for title
				const title = input.getAttribute('title')?.trim();
				if (title && title !== '') return false;
			}

			// If all checks fail, return true indicating missing content
			return true;
		},
	},
	{
		code: 'a11y-no-redundant-roles',
		title: 'HTML element has redundant ARIA roles',
		message:
			'Giving these elements an ARIA role that is already set by the browser has no effect and is redundant.',
		selector: [...a11y_implicit_semantics.keys()].join(','),
		match(element) {
			const role = element.getAttribute('role');

			if (element.localName === 'input') {
				const type = element.getAttribute('type');
				if (!type) return true;

				const implicitRoleForType = input_type_to_implicit_role.get(type);
				if (!implicitRoleForType) return true;

				if (role === implicitRoleForType) return false;
			}

			// TODO: Handle menuitem and elements that inherit their role from their parent

			const implicitRole = a11y_implicit_semantics.get(element.localName);
			if (!implicitRole) return true;

			if (role === implicitRole) return false;
		},
	},
	{
		code: 'a11y-no-interactive-element-to-noninteractive-role',
		title: 'Non-interactive ARIA role used on interactive HTML element.',
		message:
			'Interactive HTML elements like `<a>` and `<button>` cannot use non-interactive roles like `heading`, `list`, `menu`, and `toolbar`.',
		selector: `[role]:is(${interactiveElements.join(',')})`,
		match(element) {
			if (!isInteractive(element)) return false;
			const role = element.getAttribute('role');
			if (!role) return false;
			if (!ariaRoles.has(role)) return false;
			if (roleless_elements.includes(element.localName)) return false;

			if (aria_non_interactive_roles.includes(role)) return true;
		},
	},
	{
		code: 'a11y-no-noninteractive-element-to-interactive-role',
		title: 'Interactive ARIA role used on non-interactive HTML element.',
		message:
			'Interactive roles should not be used to convert a non-interactive element to an interactive element',
		selector: `[role]:not(${interactiveElements.join(',')})`,
		match(element) {
			if (!isInteractive(element)) return false;
			const role = element.getAttribute('role');
			if (!role) return false;
			if (!ariaRoles.has(role)) return false;
			const exceptions =
				a11y_non_interactive_element_to_interactive_role_exceptions[
					element.localName as keyof typeof a11y_non_interactive_element_to_interactive_role_exceptions
				];
			if (exceptions?.includes(role)) return false;
			if (roleless_elements.includes(element.localName)) return false;

			if (!aria_non_interactive_roles.includes(role)) return true;
		},
	},
	{
		code: 'a11y-no-noninteractive-tabindex',
		title: 'Invalid `tabindex` on non-interactive element',
		description:
			'The `tabindex` attribute should only be used on interactive elements, as it can be confusing for keyboard-only users to navigate through non-interactive elements. If your element is only conditionally interactive, consider using `tabindex="-1"` to make it focusable only when it is actually interactive.',
		message: (element) => `${element.localName} elements should not have \`tabindex\` attribute`,
		selector: '[tabindex]:not([role="tabpanel"])',
		match(element) {
			// Scrollable elements are considered interactive
			// See: https://www.w3.org/WAI/standards-guidelines/act/rules/0ssw9k/proposed/
			const isScrollable =
				element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
			if (isScrollable) return false;

			if (!isInteractive(element)) return false;

			if (
				!interactiveElements.includes(element.localName) &&
				!roleless_elements.includes(element.localName)
			)
				return true;
		},
	},
	{
		code: 'a11y-positive-tabindex',
		title: 'Avoid positive `tabindex` property values',
		message:
			'This will move elements out of the expected tab order, creating a confusing experience for keyboard users.',
		selector: '[tabindex]:not([tabindex="-1"]):not([tabindex="0"])',
	},
	{
		code: 'a11y-role-has-required-aria-props',
		title: 'Missing attributes required for ARIA role',
		message: (element) => {
			const { __astro_role: role, __astro_missing_attributes: required } = element as any;
			return `${
				element.localName
			} element is missing required attributes for its role (${role}): ${required.join(', ')}`;
		},
		selector: '*',
		match(element) {
			const role = getRole(element);
			if (!role) return false;
			if (is_semantic_role_element(role, element.localName, getAttributeObject(element))) {
				return;
			}

			const elementRoles = role.split(WHITESPACE_REGEX) as ARIARoleDefinitionKey[];
			for (const elementRole of elementRoles) {
				const { requiredProps } = roles.get(elementRole)!;
				const required_role_props = Object.keys(requiredProps);
				const missingProps = required_role_props.filter((prop) => !element.hasAttribute(prop));
				if (missingProps.length > 0) {
					(element as any).__astro_role = elementRole;
					(element as any).__astro_missing_attributes = missingProps;
					return true;
				}
			}
		},
	},

	{
		code: 'a11y-role-supports-aria-props',
		title: 'Unsupported ARIA attribute',
		message: (element) => {
			const { __astro_role: role, __astro_unsupported_attributes: unsupported } = element as any;
			return `${
				element.localName
			} element has ARIA attributes that are not supported by its role (${role}): ${unsupported.join(
				', ',
			)}`;
		},
		selector: '*',
		match(element) {
			const role = getRole(element);
			if (!role) return false;

			const elementRoles = role.split(WHITESPACE_REGEX) as ARIARoleDefinitionKey[];
			for (const elementRole of elementRoles) {
				const { props } = roles.get(elementRole)!;
				const attributes = getAttributeObject(element);
				const unsupportedAttributes = aria.keys().filter((attribute) => !(attribute in props));
				const invalidAttributes: string[] = Object.keys(attributes).filter(
					(key) => key.startsWith('aria-') && unsupportedAttributes.includes(key as any),
				);
				if (invalidAttributes.length > 0) {
					(element as any).__astro_role = elementRole;
					(element as any).__astro_unsupported_attributes = invalidAttributes;
					return true;
				}
			}
		},
	},
	{
		code: 'a11y-structure',
		title: 'Invalid DOM structure',
		message:
			'The DOM structure must be valid for accessibility of the page, for example `figcaption` must be a direct child of `figure`.',
		selector: 'figcaption:not(figure > figcaption)',
	},
	{
		code: 'a11y-unknown-aria-attribute',
		title: 'Unknown ARIA attribute',
		message: 'ARIA attributes prefixed with `aria-` must be valid, non-abstract ARIA attributes.',
		selector: '*',
		match(element) {
			for (const attribute of element.attributes) {
				if (attribute.name.startsWith('aria-')) {
					if (!ariaAttributes.has(attribute.name.slice('aria-'.length))) return true;
				}
			}
		},
	},
	{
		code: 'a11y-unknown-role',
		title: 'Unknown ARIA role',
		message: 'ARIA roles must be valid, non-abstract ARIA roles.',
		selector: '[role]',
		match(element) {
			const role = element.getAttribute('role');
			if (!role) return true;
			if (!ariaRoles.has(role)) return true;
		},
	},
];

/**
 * Exceptions to the rule which follows common A11y conventions
 * TODO make this configurable by the user
 * @type {Record<string, string[]>}
 */
const a11y_non_interactive_element_to_interactive_role_exceptions = {
	ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
	ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
	li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
	table: ['grid'],
	td: ['gridcell'],
	fieldset: ['radiogroup', 'presentation'],
};

const combobox_if_list = ['email', 'search', 'tel', 'text', 'url'];
function input_implicit_role(attributes: Record<string, string>) {
	if (!('type' in attributes)) return;
	const { type, list } = attributes;
	if (!type) return;
	if (list && combobox_if_list.includes(type)) {
		return 'combobox';
	}
	return input_type_to_implicit_role.get(type);
}

function menuitem_implicit_role(attributes: Record<string, string>) {
	if (!('type' in attributes)) return;
	const { type } = attributes;
	if (!type) return;
	return menuitem_type_to_implicit_role.get(type);
}

function getRole(element: Element): ARIARoleDefinitionKey | undefined {
	if (element.hasAttribute('role')) {
		return element.getAttribute('role')! as ARIARoleDefinitionKey;
	}
	return getImplicitRole(element) as ARIARoleDefinitionKey;
}

function getImplicitRole(element: Element) {
	const name = element.localName;
	const attrs = getAttributeObject(element);
	if (name === 'menuitem') {
		return menuitem_implicit_role(attrs);
	} else if (name === 'input') {
		return input_implicit_role(attrs);
	} else {
		return a11y_implicit_semantics.get(name);
	}
}

function getAttributeObject(element: Element): Record<string, string> {
	let obj: Record<string, string> = {};
	for (let i = 0; i < element.attributes.length; i++) {
		const attribute = element.attributes.item(i)!;
		obj[attribute.name] = attribute.value;
	}
	return obj;
}

function is_semantic_role_element(
	role: ARIARoleDefinitionKey,
	tag_name: string,
	attributes: Record<string, string>,
) {
	for (const [schema, ax_object] of elementAXObjects.entries()) {
		if (
			schema.name === tag_name &&
			(!schema.attributes ||
				schema.attributes.every((attr: any) => attributes[attr.name] === attr.value))
		) {
			for (const name of ax_object) {
				const axRoles = AXObjectRoles.get(name);
				if (axRoles) {
					for (const { name: _name } of axRoles) {
						if (_name === role) {
							return true;
						}
					}
				}
			}
		}
	}
	return false;
}

import type { SSRResult } from '../../../types/public/internal.js';
import { markHTMLString } from '../escape.js';
import { renderSlotToString } from './slot.js';
import { toAttributeString } from './util.js';

export function componentIsHTMLElement(Component: unknown) {
	return typeof HTMLElement !== 'undefined' && HTMLElement.isPrototypeOf(Component as object);
}

export async function renderHTMLElement(
	result: SSRResult,
	constructor: typeof HTMLElement,
	props: any,
	slots: any,
): Promise<string> {
	const name = getHTMLElementName(constructor);

	let attrHTML = '';

	for (const attr in props) {
		attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
	}

	return markHTMLString(
		`<${name}${attrHTML}>${await renderSlotToString(result, slots?.default)}</${name}>`,
	);
}

function getHTMLElementName(constructor: typeof HTMLElement) {
	const definedName = (
		customElements as CustomElementRegistry & { getName(_constructor: typeof HTMLElement): string }
	).getName(constructor);
	if (definedName) return definedName;

	const assignedName = constructor.name
		.replace(/^HTML|Element$/g, '')
		.replace(/[A-Z]/g, '-$&')
		.toLowerCase()
		.replace(/^-/, 'html-');
	return assignedName;
}

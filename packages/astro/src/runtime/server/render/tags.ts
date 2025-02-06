import type { StylesheetAsset } from '../../../core/app/types.js';
import type { SSRElement, SSRResult } from '../../../types/public/internal.js';
import { renderElement } from './util.js';

export function renderScriptElement({ props, children }: SSRElement) {
	return renderElement('script', {
		props,
		children,
	});
}

export function renderUniqueStylesheet(result: SSRResult, sheet: StylesheetAsset) {
	if (sheet.type === 'external') {
		if (Array.from(result.styles).some((s) => s.props.href === sheet.src)) return '';
		return renderElement('link', { props: { rel: 'stylesheet', href: sheet.src }, children: '' });
	}

	if (sheet.type === 'inline') {
		if (Array.from(result.styles).some((s) => s.children.includes(sheet.content))) return '';
		return renderElement('style', { props: {}, children: sheet.content });
	}
}

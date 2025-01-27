import type { SSRResult } from '../../../types/public/internal.js';
import { markHTMLString } from '../escape.js';
import type { MaybeRenderHeadInstruction, RenderHeadInstruction } from './instruction.js';
import { createRenderInstruction } from './instruction.js';
import { renderElement } from './util.js';

// Filter out duplicate elements in our set
const uniqueElements = (item: any, index: number, all: any[]) => {
	const props = JSON.stringify(item.props);
	const children = item.children;
	return (
		index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children)
	);
};

export function renderAllHeadContent(result: SSRResult) {
	result._metadata.hasRenderedHead = true;
	const styles = Array.from(result.styles)
		.filter(uniqueElements)
		.map((style) =>
			style.props.rel === 'stylesheet'
				? renderElement('link', style)
				: renderElement('style', style),
		);
	// Clear result.styles so that any new styles added will be inlined.
	result.styles.clear();
	const scripts = Array.from(result.scripts)
		.filter(uniqueElements)
		.map((script) => {
			return renderElement('script', script, false);
		});
	const links = Array.from(result.links)
		.filter(uniqueElements)
		.map((link) => renderElement('link', link, false));

	// Order styles -> links -> scripts similar to src/content/runtime.ts
	// The order is usually fine as the ordering between these groups are mutually exclusive,
	// except for CSS styles and CSS stylesheet links. However CSS stylesheet links usually
	// consist of CSS modules which should naturally take precedence over CSS styles, so the
	// order will still work. In prod, all CSS are stylesheet links.
	// In the future, it may be better to have only an array of head elements to avoid these assumptions.
	let content = styles.join('\n') + links.join('\n') + scripts.join('\n');

	if (result._metadata.extraHead.length > 0) {
		for (const part of result._metadata.extraHead) {
			content += part;
		}
	}

	return markHTMLString(content);
}

export function renderHead(): RenderHeadInstruction {
	return createRenderInstruction({ type: 'head' });
}

// This function is called by Astro components that do not contain a <head> component
// This accommodates the fact that using a <head> is optional in Astro, so this
// is called before a component's first non-head HTML element. If the head was
// already injected it is a noop.
export function maybeRenderHead(): MaybeRenderHeadInstruction {
	// This is an instruction informing the page rendering that head might need rendering.
	// This allows the page to deduplicate head injections.
	return createRenderInstruction({ type: 'maybe-head' });
}

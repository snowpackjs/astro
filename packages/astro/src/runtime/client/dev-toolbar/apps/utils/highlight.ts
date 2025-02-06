import type { DevToolbarHighlight } from '../../ui-library/highlight.js';
import type { Icon } from '../../ui-library/icons.js';

export function createHighlight(
	rect: DOMRect,
	icon?: Icon,
	additionalAttributes?: Record<string, string>,
) {
	const highlight = document.createElement('astro-dev-toolbar-highlight');
	if (icon) highlight.icon = icon;

	if (additionalAttributes) {
		for (const [key, value] of Object.entries(additionalAttributes)) {
			highlight.setAttribute(key, value);
		}
	}

	highlight.tabIndex = 0;

	if (rect.width === 0 || rect.height === 0) {
		highlight.style.display = 'none';
	} else {
		positionHighlight(highlight, rect);
	}
	return highlight;
}

// Figures out the element's position, based on it's parents.
export function getElementsPositionInDocument(el: Element) {
	let isFixed = false;
	let current: Element | ParentNode | null = el;
	while (current instanceof Element) {
		// all the way up the tree. We are only doing so when the app initializes, so the cost is one-time
		// If perf becomes an issue we'll want to refactor this somehow so that it reads this info in a rAF
		let style = getComputedStyle(current);
		if (style.position === 'fixed') {
			isFixed = true;
		}
		current = current.parentNode;
	}
	return {
		isFixed,
	};
}

export function positionHighlight(highlight: DevToolbarHighlight, rect: DOMRect) {
	highlight.style.display = 'block';
	// If the highlight is fixed, don't position based on scroll
	const scrollY = highlight.style.position === 'fixed' ? 0 : window.scrollY;
	// Make an highlight that is 10px bigger than the element on all sides
	highlight.style.top = `${Math.max(rect.top + scrollY - 10, 0)}px`;
	highlight.style.left = `${Math.max(rect.left + window.scrollX - 10, 0)}px`;
	highlight.style.width = `${rect.width + 15}px`;
	highlight.style.height = `${rect.height + 15}px`;
}

export function attachTooltipToHighlight(
	highlight: DevToolbarHighlight,
	tooltip: HTMLElement,
	originalElement: Element,
) {
	highlight.shadowRoot.append(tooltip);

	(['mouseover', 'focus'] as const).forEach((event) => {
		highlight.addEventListener(event, () => {
			tooltip.dataset.show = 'true';
			const originalRect = originalElement.getBoundingClientRect();
			const dialogRect = tooltip.getBoundingClientRect();

			// Prevent the tooltip from being off the screen
			if (originalRect.top < dialogRect.height) {
				// Not enough space above, show below
				tooltip.style.top = `${originalRect.height + 15}px`;
			} else {
				tooltip.style.top = `-${tooltip.offsetHeight}px`;
			}
			if (dialogRect.right > document.documentElement.clientWidth) {
				// Not enough space on the right, align to the right
				tooltip.style.right = '0px';
			} else if (dialogRect.left < 0) {
				// Not enough space on the left, align to the left
				tooltip.style.left = '0px';
			}
		});
	});

	(['mouseout', 'blur'] as const).forEach((event) => {
		highlight.addEventListener(event, () => {
			tooltip.dataset.show = 'false';
		});
	});
}

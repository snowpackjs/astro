import { settings } from '../../settings.js';
import type { Placement } from '../../ui-library/window.js';

export function createWindowElement(content: string, placement = settings.config.placement) {
	const windowElement = document.createElement('astro-dev-toolbar-window');
	windowElement.innerHTML = content;
	windowElement.placement = placement;
	return windowElement;
}

export function closeOnOutsideClick(
	eventTarget: EventTarget,
	additionalCheck?: (target: Element) => boolean,
) {
	function onPageClick(event: MouseEvent) {
		const target = event.target as Element | null;
		if (!target) return;
		if (!target.closest) return;
		if (target.closest('astro-dev-toolbar')) return;
		if (additionalCheck && additionalCheck(target)) return;
		eventTarget.dispatchEvent(
			new CustomEvent('toggle-app', {
				detail: {
					state: false,
				},
			}),
		);
	}
	eventTarget.addEventListener('app-toggled', (event: any) => {
		if (event.detail.state === true) {
			document.addEventListener('click', onPageClick, true);
		} else {
			document.removeEventListener('click', onPageClick, true);
		}
	});
}

export function synchronizePlacementOnUpdate(eventTarget: EventTarget, canvas: ShadowRoot) {
	eventTarget.addEventListener('placement-updated', (evt) => {
		if (!(evt instanceof CustomEvent)) {
			return;
		}
		const windowElement = canvas.querySelector('astro-dev-toolbar-window');
		if (!windowElement) {
			return;
		}
		const event: CustomEvent<{ placement: Placement }> = evt;
		windowElement.placement = event.detail.placement;
	});
}

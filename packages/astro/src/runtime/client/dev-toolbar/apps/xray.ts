import { escape as escapeHTML } from 'html-escaper';
import type {
	DevToolbarMetadata,
	ResolvedDevToolbarApp,
} from '../../../../types/public/toolbar.js';
import type { DevToolbarHighlight } from '../ui-library/highlight.js';
import {
	attachTooltipToHighlight,
	createHighlight,
	getElementsPositionInDocument,
	positionHighlight,
} from './utils/highlight.js';
import {
	closeOnOutsideClick,
	createWindowElement,
	synchronizePlacementOnUpdate,
} from './utils/window.js';

const icon =
	'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M7.9 1.5v-.4a1.1 1.1 0 0 1 2.2 0v.4a1.1 1.1 0 1 1-2.2 0Zm-6.4 8.6a1.1 1.1 0 1 0 0-2.2h-.4a1.1 1.1 0 0 0 0 2.2h.4ZM12 3.7a1.1 1.1 0 0 0 1.4-.7l.4-1.1a1.1 1.1 0 0 0-2.1-.8l-.4 1.2a1.1 1.1 0 0 0 .7 1.4Zm-9.7 7.6-1.2.4a1.1 1.1 0 1 0 .8 2.1l1-.4a1.1 1.1 0 1 0-.6-2ZM20.8 17a1.9 1.9 0 0 1 0 2.6l-1.2 1.2a1.9 1.9 0 0 1-2.6 0l-4.3-4.2-1.6 3.6a1.9 1.9 0 0 1-1.7 1.2A1.9 1.9 0 0 1 7.5 20L2.7 5a1.9 1.9 0 0 1 2.4-2.4l15 5a1.9 1.9 0 0 1 .2 3.4l-3.7 1.6 4.2 4.3ZM19 18.3 14.6 14a1.9 1.9 0 0 1 .6-3l3.2-1.5L5.1 5.1l4.3 13.3 1.5-3.2a1.9 1.9 0 0 1 3-.6l4.4 4.4.7-.7Z"/></svg>';

export default {
	id: 'astro:xray',
	name: 'Inspect',
	icon: icon,
	init(canvas, eventTarget) {
		let islandsOverlays: { highlightElement: DevToolbarHighlight; island: HTMLElement }[] = [];

		addIslandsOverlay();

		document.addEventListener('astro:after-swap', addIslandsOverlay);
		document.addEventListener('astro:page-load', refreshIslandsOverlayPositions);

		closeOnOutsideClick(eventTarget);
		synchronizePlacementOnUpdate(eventTarget, canvas);

		function addIslandsOverlay() {
			islandsOverlays.forEach(({ highlightElement }) => {
				highlightElement.remove();
			});
			islandsOverlays = [];

			const islands = document.querySelectorAll<HTMLElement>('astro-island');

			if (islands.length === 0) {
				const window = createWindowElement(
					`<style>
						header {
							display: flex;
						}

						h1 {
							display: flex;
							align-items: center;
							gap: 8px;
							font-weight: 600;
							color: #fff;
							margin: 0;
							font-size: 22px;
						}

						astro-dev-toolbar-icon {
							width: 1em;
						   height: 1em;
						   padding: 8px;
							display: block;
							background: #5f9ea0;
							border-radius: 9999px;
						}
					</style>
					<header>
						<h1><astro-dev-toolbar-icon icon="lightbulb"></astro-dev-toolbar-icon>No islands detected.</h1>
					</header>
					<p>
						It looks like there are no interactive component islands on this page. Did you forget to add a client directive to your interactive UI component?
					</p>
					`,
				);

				canvas.append(window);
				return;
			}

			islands.forEach((island) => {
				const computedStyle = window.getComputedStyle(island);
				const islandElement = (island.children[0] as HTMLElement) || island;

				// If the island is hidden, don't show an overlay on it
				// TODO: For `client:only` islands, it might not have finished loading yet, so we should wait for that
				if (islandElement.offsetParent === null || computedStyle.display === 'none') {
					return;
				}

				const rect = islandElement.getBoundingClientRect();
				const highlight = createHighlight(rect);
				const tooltip = buildIslandTooltip(island);

				// Set the highlight/tooltip as being fixed position the highlighted element
				// is fixed. We do this so that we don't mistakenly take scroll position
				// into account when setting the tooltip/highlight positioning.
				//
				// We only do this once due to how expensive computed styles are to calculate,
				// and are unlikely to change. If that turns out to be wrong, reconsider this.
				const { isFixed } = getElementsPositionInDocument(islandElement);
				if (isFixed) {
					tooltip.style.position = highlight.style.position = 'fixed';
				}

				attachTooltipToHighlight(highlight, tooltip, islandElement);
				canvas.append(highlight);
				islandsOverlays.push({ highlightElement: highlight, island: islandElement });
			});

			(['scroll', 'resize'] as const).forEach((event) => {
				window.addEventListener(event, refreshIslandsOverlayPositions);
			});
		}

		function refreshIslandsOverlayPositions() {
			islandsOverlays.forEach(({ highlightElement, island: islandElement }) => {
				const rect = islandElement.getBoundingClientRect();
				positionHighlight(highlightElement, rect);
			});
		}

		function buildIslandTooltip(island: HTMLElement) {
			const tooltip = document.createElement('astro-dev-toolbar-tooltip');
			tooltip.sections = [];

			const islandProps = island.getAttribute('props')
				? JSON.parse(island.getAttribute('props')!)
				: {};
			const islandClientDirective = island.getAttribute('client');

			// Add the component client's directive if we have one
			if (islandClientDirective) {
				tooltip.sections.push({
					title: 'Client directive',
					inlineTitle: `<code>client:${islandClientDirective}</code>`,
				});
			}

			// Display the props if we have any
			// Ignore the "data-astro-cid-XXXXXX" prop (internal)
			const islandPropsEntries = Object.entries(islandProps).filter(
				(prop: any) => !prop[0].startsWith('data-astro-cid-'),
			);
			if (islandPropsEntries.length > 0) {
				const stringifiedProps = JSON.stringify(
					Object.fromEntries(islandPropsEntries.map((prop: any) => [prop[0], prop[1][1]])),
					undefined,
					2,
				);
				tooltip.sections.push({
					title: 'Props',
					content: `<pre><code>${escapeHTML(stringifiedProps)}</code></pre>`,
				});
			}

			// Add a click action to go to the file
			const islandComponentPath = island.getAttribute('component-url');
			if (islandComponentPath) {
				tooltip.sections.push({
					content: islandComponentPath,
					clickDescription: 'Click to go to file',
					async clickAction() {
						// NOTE: The path here has to be absolute and without any errors (no double slashes etc)
						// or Vite will silently fail to open the file. Quite annoying.
						await fetch(
							'/__open-in-editor?file=' +
								encodeURIComponent(
									(window as DevToolbarMetadata).__astro_dev_toolbar__.root +
										islandComponentPath.slice(1),
								),
						);
					},
				});
			}

			return tooltip;
		}
	},
} satisfies ResolvedDevToolbarApp;

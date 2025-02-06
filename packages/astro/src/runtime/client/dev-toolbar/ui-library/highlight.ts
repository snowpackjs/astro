import { settings } from '../settings.js';
import { type Icon, getIconElement, isDefinedIcon } from './icons.js';

const styles = ['purple', 'gray', 'red', 'green', 'yellow', 'blue'] as const;

type HighlightStyle = (typeof styles)[number];

export class DevToolbarHighlight extends HTMLElement {
	icon?: Icon | undefined | null;
	_highlightStyle: HighlightStyle = 'purple';

	get highlightStyle() {
		return this._highlightStyle;
	}

	set highlightStyle(value) {
		if (!styles.includes(value)) {
			settings.logger.error(
				`Invalid style: ${value}, expected one of ${styles.join(', ')}, got ${value}.`,
			);
			return;
		}
		this._highlightStyle = value;
		this.updateStyle();
	}

	static observedAttributes = ['highlight-style'];

	shadowRoot: ShadowRoot;

	constructor() {
		super();
		this.shadowRoot = this.attachShadow({ mode: 'open' });

		this.icon = this.hasAttribute('icon') ? (this.getAttribute('icon') as Icon) : undefined;

		this.shadowRoot.innerHTML = `
			<style>
				:host {
					--purple-background: linear-gradient(180deg, rgba(224, 204, 250, 0.33) 0%, rgba(224, 204, 250, 0.0825) 100%);
					--purple-border: 1px solid rgba(113, 24, 226, 1);

					--gray-background: linear-gradient(180deg, rgba(191, 193, 201, 0.33) 0%, rgba(191, 193, 201, 0.0825) 100%);
					--gray-border: 1px solid rgba(191, 193, 201, 1);

					--red-background: linear-gradient(180deg, rgba(249, 196, 215, 0.33) 0%, rgba(249, 196, 215, 0.0825) 100%);
					--red-border: 1px solid rgba(179, 62, 102, 1);

					--green-background: linear-gradient(180deg, rgba(213, 249, 196, 0.33) 0%, rgba(213, 249, 196, 0.0825) 100%);
					--green-border: 1px solid rgba(61, 125, 31, 1);

					--yellow-background: linear-gradient(180deg, rgba(255, 236, 179, 0.33) 0%, rgba(255, 236, 179, 0.0825) 100%);
					--yellow-border: 1px solid rgba(181, 138, 45, 1);

					--blue-background: linear-gradient(180deg, rgba(189, 195, 255, 0.33) 0%, rgba(189, 195, 255, 0.0825) 100%);
					--blue-border: 1px solid rgba(54, 69, 217, 1);

					border-radius: 4px;
					display: block;
					width: 100%;
					height: 100%;
					position: absolute;
					z-index: 2000000000;

					background: var(--background);
					border: var(--border);
				}

				.icon {
					width: 24px;
					height: 24px;
					color: white;
					background: linear-gradient(0deg, #B33E66, #B33E66), linear-gradient(0deg, #351722, #351722);
					border: 1px solid rgba(53, 23, 34, 1);
					border-radius: 9999px;
					display: flex;
					justify-content: center;
					align-items: center;
					position: absolute;
					top: -15px;
					right: -15px;
				}
			</style>
			<style id="selected-style"></style>
		`;
	}

	updateStyle() {
		const style = this.shadowRoot.querySelector<HTMLStyleElement>('#selected-style');

		if (style) {
			style.innerHTML = `
			:host {
				--background: var(--${this.highlightStyle}-background);
				--border: var(--${this.highlightStyle}-border);
			}`;
		}
	}

	attributeChangedCallback() {
		if (this.hasAttribute('highlight-style'))
			this.highlightStyle = this.getAttribute('highlight-style') as HighlightStyle;
	}

	connectedCallback() {
		this.updateStyle();

		if (this.icon) {
			let iconContainer = document.createElement('div');
			iconContainer.classList.add('icon');

			let iconElement;
			if (isDefinedIcon(this.icon)) {
				iconElement = getIconElement(this.icon);
			} else {
				iconElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				iconElement.setAttribute('viewBox', '0 0 16 16');
				iconElement.innerHTML = this.icon;
			}

			if (iconElement) {
				iconElement?.style.setProperty('width', '16px');
				iconElement?.style.setProperty('height', '16px');

				iconContainer.append(iconElement);
				this.shadowRoot.append(iconContainer);
			}
		}
	}
}

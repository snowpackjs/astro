import { settings } from '../settings.js';

const sizes = ['small', 'large'] as const;
const styles = ['purple', 'gray', 'red', 'green', 'yellow', 'blue'] as const;

type BadgeSize = (typeof sizes)[number];
type BadgeStyle = (typeof styles)[number];

export class DevToolbarBadge extends HTMLElement {
	_size: BadgeSize = 'small';
	_badgeStyle: BadgeStyle = 'purple';

	get size() {
		return this._size;
	}

	set size(value) {
		if (!sizes.includes(value)) {
			settings.logger.error(
				`Invalid size: ${value}, expected one of ${sizes.join(', ')}, got ${value}.`,
			);
			return;
		}
		this._size = value;
		this.updateStyle();
	}

	get badgeStyle() {
		return this._badgeStyle;
	}

	set badgeStyle(value) {
		if (!styles.includes(value)) {
			settings.logger.error(
				`Invalid style: ${value}, expected one of ${styles.join(', ')}, got ${value}.`,
			);
			return;
		}
		this._badgeStyle = value;
		this.updateStyle();
	}

	shadowRoot: ShadowRoot;

	static observedAttributes = ['badge-style', 'size'];

	constructor() {
		super();
		this.shadowRoot = this.attachShadow({ mode: 'open' });

		this.shadowRoot.innerHTML = `
			<style>
				.badge {
					box-sizing: border-box;
					border-radius: 4px;
					border: 1px solid transparent;
					padding: 8px;
					font-size: 12px;
					color: var(--text-color);
					height: var(--size);
					border: 1px solid var(--border-color);
					display: flex;
					align-items: center;
					justify-content: center;
					font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

					--purple-text: rgba(224, 204, 250, 1);
					--purple-border: rgba(113, 24, 226, 1);

					--gray-text: rgba(191, 193, 201, 1);
					--gray-border:rgba(191, 193, 201, 1);

					--red-text: rgba(249, 196, 215, 1);
					--red-border: rgba(179, 62, 102, 1);

					--green-text: rgba(213, 249, 196, 1);
					--green-border: rgba(61, 125, 31, 1);

					--yellow-text: rgba(249, 233, 196, 1);
					--yellow-border: rgba(181, 138, 45, 1);

					--blue-text: rgba(189, 195, 255, 1);
					--blue-border: rgba(54, 69, 217, 1);

					--large: 24px;
					--small: 20px;
				}
			</style>
			<style id="selected-style"></style>

			<div class="badge">
				<slot></slot>
			</div>
			`;
	}

	connectedCallback() {
		this.updateStyle();
	}

	attributeChangedCallback() {
		if (this.hasAttribute('badge-style'))
			this.badgeStyle = this.getAttribute('badge-style') as BadgeStyle;

		if (this.hasAttribute('size')) this.size = this.getAttribute('size') as BadgeSize;
	}

	updateStyle() {
		const style = this.shadowRoot.querySelector<HTMLStyleElement>('#selected-style');

		if (style) {
			style.innerHTML = `
			.badge {
				--text-color: var(--${this.badgeStyle}-text);
				--border-color: var(--${this.badgeStyle}-border);
				--size: var(--${this.size});
			}`;
		}
	}
}

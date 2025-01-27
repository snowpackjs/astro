import { settings } from '../settings.js';

const sizes = ['small', 'medium', 'large'] as const;
const styles = ['ghost', 'outline', 'purple', 'gray', 'red', 'green', 'yellow', 'blue'] as const;
const borderRadii = ['normal', 'rounded'] as const;

type ButtonSize = (typeof sizes)[number];
type ButtonStyle = (typeof styles)[number];
type ButtonBorderRadius = (typeof borderRadii)[number];

export class DevToolbarButton extends HTMLElement {
	_size: ButtonSize = 'small';
	_buttonStyle: ButtonStyle = 'purple';
	_buttonBorderRadius: ButtonBorderRadius = 'normal';

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

	get buttonStyle() {
		return this._buttonStyle;
	}

	set buttonStyle(value) {
		if (!styles.includes(value)) {
			settings.logger.error(
				`Invalid style: ${value}, expected one of ${styles.join(', ')}, got ${value}.`,
			);
			return;
		}
		this._buttonStyle = value;
		this.updateStyle();
	}

	get buttonBorderRadius() {
		return this._buttonBorderRadius;
	}

	set buttonBorderRadius(value) {
		if (!borderRadii.includes(value)) {
			settings.logger.error(
				`Invalid border-radius: ${value}, expected one of ${borderRadii.join(', ')}, got ${value}.`,
			);
			return;
		}
		this._buttonBorderRadius = value;
		this.updateStyle();
	}

	static observedAttributes = ['button-style', 'size', 'button-border-radius'];

	shadowRoot: ShadowRoot;

	constructor() {
		super();
		this.shadowRoot = this.attachShadow({ mode: 'open' });

		this.shadowRoot.innerHTML = `
			<style>
				button {
					--purple-background: rgba(113, 24, 226, 1);
					--purple-border: rgba(224, 204, 250, 0.33);
					--purple-text: #fff;

					--gray-background: rgba(52, 56, 65, 1);
					--gray-border: rgba(71, 78, 94, 1);
					--gray-text: #fff;

					--red-background: rgba(179, 62, 102, 1);
					--red-border: rgba(249, 196, 215, 0.33);
					--red-text: #fff;

					--green-background: rgba(213, 249, 196, 1);
					--green-border: rgba(61, 125, 31, 1);
					--green-text: #000;

					--yellow-background: rgba(255, 236, 179, 1);
					--yellow-border: rgba(255, 191, 0, 1);
					--yellow-text: #000;

					--blue-background: rgba(54, 69, 217, 1);
					--blue-border: rgba(189, 195, 255, 1);
					--blue-text: #fff;

					--outline-background: transparent;
					--outline-border: #fff;
					--outline-text: #fff;

					--ghost-background: transparent;
					--ghost-border: transparent;
					--ghost-text: #fff;

					--large-font-size: 16px;
					--medium-font-size: 14px;
					--small-font-size: 12px;

					--large-padding: 12px 16px;
					--large-rounded-padding: 12px 12px;
					--medium-padding: 8px 12px;
					--medium-rounded-padding: 8px 8px;
					--small-padding: 4px 8px;
					--small-rounded-padding: 4px 4px;

					--normal-border-radius: 4px;
					--rounded-border-radius: 9999px;

					border: 1px solid var(--border);
					padding: var(--padding);
					font-size: var(--font-size);
					background: var(--background);

					color: var(--text-color);
					border-radius: var(--border-radius);
					display: flex;
					align-items: center;
					justify-content: center;
				}

				button:hover {
					cursor: pointer;
				}

				::slotted(astro-dev-toolbar-icon) {
					display: inline-block;
					height: 1em;
					width: 1em;
					margin-left: 0.5em;
				}
			</style>
			<style id="selected-style"></style>

			<button>
				<slot></slot>
			</button>
		`;
	}

	connectedCallback() {
		this.updateStyle();
	}

	updateStyle() {
		const style = this.shadowRoot.querySelector<HTMLStyleElement>('#selected-style');

		if (style) {
			style.innerHTML = `
			button {
				--background: var(--${this.buttonStyle}-background);
				--border: var(--${this.buttonStyle}-border);
				--font-size: var(--${this.size}-font-size);
				--text-color: var(--${this.buttonStyle}-text);
				${
					this.buttonBorderRadius === 'normal'
						? '--padding: var(--' + this.size + '-padding);'
						: '--padding: var(--' + this.size + '-rounded-padding);'
				}
				--border-radius: var(--${this.buttonBorderRadius}-border-radius);
			}`;
		}
	}

	attributeChangedCallback() {
		if (this.hasAttribute('size')) this.size = this.getAttribute('size') as ButtonSize;

		if (this.hasAttribute('button-style'))
			this.buttonStyle = this.getAttribute('button-style') as ButtonStyle;
	}
}

import { settings } from '../settings.js';

const styles = ['purple', 'gray', 'red', 'green', 'yellow', 'blue'] as const;

type ToggleStyle = (typeof styles)[number];

export class DevToolbarToggle extends HTMLElement {
	shadowRoot: ShadowRoot;
	input: HTMLInputElement;
	_toggleStyle: ToggleStyle = 'gray';

	get toggleStyle() {
		return this._toggleStyle;
	}

	set toggleStyle(value) {
		if (!styles.includes(value)) {
			settings.logger.error(`Invalid style: ${value}, expected one of ${styles.join(', ')}.`);
			return;
		}
		this._toggleStyle = value;
		this.updateStyle();
	}

	static observedAttributes = ['toggle-style'];

	constructor() {
		super();
		this.shadowRoot = this.attachShadow({ mode: 'open' });

		this.shadowRoot.innerHTML = `
		<style>
			:host {
				--purple-bg-on: rgba(113, 24, 226, 1);
				--purple-border-off: rgba(113, 24, 226, 1);
				--purple-border-on: rgba(224, 204, 250, 1);

				--gray-bg-on: rgba(61, 125, 31, 1);
				--gray-border-off: rgba(145, 152, 173, 1);
				--gray-border-on: rgba(213, 249, 196, 1);

				--red-bg-on: rgba(179, 62, 102, 1);
				--red-border-off: rgba(179, 62, 102, 1);
				--red-border-on: rgba(249, 196, 215, 1);

				--green-bg-on: rgba(61, 125, 31, 1);
				--green-border-off: rgba(61, 125, 31, 1);
				--green-border-on: rgba(213, 249, 196, 1);

				--yellow-bg-on: rgba(181, 138, 45, 1);
				--yellow-border-off: rgba(181, 138, 45, 1);
				--yellow-border-on: rgba(255, 236, 179, 1);

				--blue-bg-on: rgba(54, 69, 217, 1);
				--blue-border-off: rgba(54, 69, 217, 1);
				--blue-border-on: rgba(189, 195, 255, 1);
			}

			input {
				appearance: none;
				width: 32px;
				height: 20px;
				border: 1px solid var(--border-off);
				transition: background-color 0.2s ease, border-color 0.2s ease;
				border-radius: 9999px;
			}

			input::after {
				content: '';
				width: 16px;
				display: inline-block;
				height: 16px;
				background-color: var(--border-off);
				border-radius: 9999px;
				transition: transform 0.2s ease, background-color 0.2s ease;
				top: 1px;
				left: 1px;
				position: relative;
			}

			@media (forced-colors: active) {
				input::after {
					border: 1px solid black;
					top: 0px;
					left: 0px;
				}
			}

			input:checked {
				border: 1px solid var(--border-on);
				background-color: var(--bg-on);
			}

			input:checked::after {
				transform: translateX(12px);
				background: var(--border-on);
			}
		</style>
		<style id="selected-style"></style>
		`;

		this.input = document.createElement('input');
	}

	attributeChangedCallback() {
		if (this.hasAttribute('toggle-style'))
			this.toggleStyle = this.getAttribute('toggle-style') as ToggleStyle;
	}

	updateStyle() {
		const style = this.shadowRoot.querySelector<HTMLStyleElement>('#selected-style');
		if (style) {
			style.innerHTML = `
			:host {
				--bg-on: var(--${this.toggleStyle}-bg-on);
				--border-off: var(--${this.toggleStyle}-border-off);
				--border-on: var(--${this.toggleStyle}-border-on);
			}
		`;
		}
	}

	connectedCallback() {
		this.input.type = 'checkbox';
		this.input.name = 'dev-toolbar-toggle';
		this.shadowRoot.append(this.input);
		this.updateStyle();
	}

	get value() {
		return this.input.value;
	}

	set value(val) {
		this.input.value = val;
	}
}

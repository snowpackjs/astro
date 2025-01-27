const styles = ['purple', 'gray', 'red', 'green', 'yellow', 'blue'] as const;

type RadioStyle = (typeof styles)[number];

export class DevToolbarRadioCheckbox extends HTMLElement {
	private _radioStyle: RadioStyle = 'purple';
	input: HTMLInputElement;

	shadowRoot: ShadowRoot;

	get radioStyle() {
		return this._radioStyle;
	}

	set radioStyle(value) {
		if (!styles.includes(value)) {
			console.error(`Invalid style: ${value}, expected one of ${styles.join(', ')}.`);
			return;
		}
		this._radioStyle = value;
		this.updateStyle();
	}

	static observedAttributes = ['radio-style', 'checked', 'disabled', 'name', 'value'];

	constructor() {
		super();
		this.shadowRoot = this.attachShadow({ mode: 'open' });

		this.shadowRoot.innerHTML = `
		<style>
			:host {
				--purple-unchecked: rgba(224, 204, 250, 0.33);
				--purple-checked: rgba(224, 204, 250, 1);

				--gray-unchecked: rgba(191, 193, 201, 0.33);
				--gray-checked: rgba(191, 193, 201, 1);

				--red-unchecked: rgba(249, 196, 215, 0.33);
				--red-checked: rgba(179, 62, 102, 1);

				--green-unchecked: rgba(213, 249, 196, 0.33);
				--green-checked: rgba(61, 125, 31, 1);

				--yellow-unchecked: rgba(255, 236, 179, 0.33);
				--yellow-checked: rgba(181, 138, 45, 1);

				--blue-unchecked: rgba(189, 195, 255, 0.33);
				--blue-checked: rgba(54, 69, 217, 1);
			}

			input[type="radio"] {
				appearance: none;
				-webkit-appearance: none;
				display: flex;
				align-content: center;
				justify-content: center;
				border: 2px solid var(--unchecked-color);
				border-radius: 9999px;
				width: 16px;
				height: 16px;
			}

			input[type="radio"]::before {
				content: "";
				background-color: var(--checked-color);
				width: 8px;
				height: 8px;
				border-radius: 9999px;
				visibility: hidden;
				margin: 2px;
			}

			input[type="radio"]:checked {
				border-color: var(--checked-color);
			}

			input[type="radio"]:checked::before {
				visibility: visible;
			}
		</style>
		<style id="selected-style"></style>
		`;
		this.input = document.createElement('input');
		this.input.type = 'radio';
		this.shadowRoot.append(this.input);
	}

	connectedCallback() {
		this.updateInputState();
		this.updateStyle();
	}

	updateStyle() {
		const styleElement = this.shadowRoot.querySelector<HTMLStyleElement>('#selected-style');

		if (styleElement) {
			styleElement.innerHTML = `
				:host {
					--unchecked-color: var(--${this._radioStyle}-unchecked);
					--checked-color: var(--${this._radioStyle}-checked);
				}
			`;
		}
	}

	updateInputState() {
		this.input.checked = this.hasAttribute('checked');
		this.input.disabled = this.hasAttribute('disabled');
		this.input.name = this.getAttribute('name') || '';
		this.input.value = this.getAttribute('value') || '';
	}

	attributeChangedCallback() {
		if (this.hasAttribute('radio-style')) {
			this.radioStyle = this.getAttribute('radio-style') as RadioStyle;
		}

		this.updateInputState();
	}
}

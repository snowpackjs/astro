import { settings } from '../settings.js';

const styles = ['purple', 'gray', 'red', 'green', 'yellow', 'blue'] as const;

type SelectStyle = (typeof styles)[number];

export class DevToolbarSelect extends HTMLElement {
	shadowRoot: ShadowRoot;
	element: HTMLSelectElement;
	_selectStyle: SelectStyle = 'gray';

	get selectStyle() {
		return this._selectStyle;
	}
	set selectStyle(value) {
		if (!styles.includes(value)) {
			settings.logger.error(`Invalid style: ${value}, expected one of ${styles.join(', ')}.`);
			return;
		}
		this._selectStyle = value;
		this.updateStyle();
	}

	static observedAttributes = ['select-style'];

	constructor() {
		super();
		this.shadowRoot = this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
      <style>
        :host {
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

          --text-color: var(--gray-text);
          --border-color: var(--gray-border);
        }
        select {
          appearance: none;
          text-align-last: center;
          display: inline-block;
          font-family: system-ui, sans-serif;
          font-size: 14px;
          padding: 4px 24px 4px 8px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-color);
          background-color: transparent;
          background-image:
            linear-gradient(45deg, transparent 50%, var(--text-color) 50%),
            linear-gradient(135deg, var(--text-color) 50%, transparent 50%);
          background-position:
            calc(100% - 12px) calc(1em - 2px),
            calc(100% - 8px) calc(1em - 2px);
          background-size: 4px 4px;
          background-repeat: no-repeat;
        }
      </style>
      <style id="selected-style"></style>
      <slot></slot>
    `;
		this.element = document.createElement('select');
		this.shadowRoot.addEventListener('slotchange', (event) => {
			if (event.target instanceof HTMLSlotElement) {
				// Manually add slotted elements to <select> because it only accepts <option> as children and escapes other elements including <slot>
				this.element.append(...event.target.assignedNodes());
			}
		});
	}

	connectedCallback() {
		this.element.name = 'dev-toolbar-select';
		this.shadowRoot.append(this.element);
		this.updateStyle();
	}

	attributeChangedCallback() {
		if (this.hasAttribute('select-style')) {
			this.selectStyle = this.getAttribute('select-style') as SelectStyle;
		}
	}

	updateStyle() {
		const style = this.shadowRoot.querySelector<HTMLStyleElement>('#selected-style');
		if (style) {
			style.innerHTML = `
        :host {
          --text-color: var(--${this.selectStyle}-text);
          --border-color: var(--${this.selectStyle}-border);
        }
      `;
		}
	}
}

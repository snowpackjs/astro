import { type Icon, getIconElement, isDefinedIcon } from './icons.js';

export class DevToolbarIcon extends HTMLElement {
	_icon: Icon | undefined = undefined;
	shadowRoot: ShadowRoot;

	get icon() {
		return this._icon;
	}
	set icon(name: Icon | undefined) {
		this._icon = name;
		this.buildTemplate();
	}

	constructor() {
		super();

		this.shadowRoot = this.attachShadow({ mode: 'open' });

		if (this.hasAttribute('icon')) {
			this.icon = this.getAttribute('icon') as Icon;
		} else {
			this.buildTemplate();
		}
	}

	getIconHTML(icon: Icon | undefined) {
		if (icon && isDefinedIcon(icon)) {
			return getIconElement(icon)?.outerHTML ?? '';
		}

		// If the icon that was passed isn't one of the predefined one, assume that they're passing it in as a slot
		return '<slot />';
	}

	buildTemplate() {
		this.shadowRoot.innerHTML = `
			<style>
				svg {
					width: 100%;
					height: 100%;
				}

				@media (forced-colors: active) {
					svg path[fill="#fff"] {
						fill: black;
					}
				}
			</style>\n${this.getIconHTML(this._icon)}`;
	}
}

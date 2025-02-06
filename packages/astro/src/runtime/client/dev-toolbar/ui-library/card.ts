import { settings } from '../settings.js';

const styles = ['purple', 'gray', 'red', 'green', 'yellow', 'blue'] as const;

type CardStyle = (typeof styles)[number];

export class DevToolbarCard extends HTMLElement {
	link?: string | undefined | null;
	clickAction?: () => void | (() => Promise<void>);
	shadowRoot: ShadowRoot;

	_cardStyle: CardStyle = 'purple';

	get cardStyle() {
		return this._cardStyle;
	}

	set cardStyle(value) {
		if (!styles.includes(value)) {
			settings.logger.error(
				`Invalid style: ${value}, expected one of ${styles.join(', ')}, got ${value}.`,
			);
			return;
		}
		this._cardStyle = value;
		this.updateStyle();
	}

	static observedAttributes = ['card-style'];

	constructor() {
		super();
		this.shadowRoot = this.attachShadow({ mode: 'open' });

		this.link = this.getAttribute('link');
	}

	attributeChangedCallback() {
		if (this.hasAttribute('card-style'))
			this.cardStyle = this.getAttribute('card-style') as CardStyle;

		this.updateStyle();
	}

	updateStyle() {
		const style = this.shadowRoot.querySelector<HTMLStyleElement>('#selected-style');

		if (style) {
			style.innerHTML = `
				:host {
					--hover-background: var(--${this.cardStyle}-hover-background);
					--hover-border: var(--${this.cardStyle}-hover-border);
				}
			`;
		}
	}

	connectedCallback() {
		const element = this.link ? 'a' : this.clickAction ? 'button' : 'div';

		this.shadowRoot.innerHTML += `
			<style>
				:host {
					--purple-hover-background: rgba(136, 58, 234, 0.33);
					--purple-hover-border: 1px solid rgba(113, 24, 226, 1);

					--gray-hover-background: rgba(191, 193, 201, 0.33);
					--gray-hover-border: 1px solid rgba(191, 193, 201, 1);

					--red-hover-background: rgba(249, 196, 215, 0.33);
					--red-hover-border: 1px solid rgba(179, 62, 102, 1);

					--green-hover-background: rgba(213, 249, 196, 0.33);
					--green-hover-border: 1px solid rgba(61, 125, 31, 1);

					--yellow-hover-background: rgba(255, 236, 179, 0.33);
					--yellow-hover-border: 1px solid rgba(255, 191, 0, 1);

					--blue-hover-background: rgba(189, 195, 255, 0.33);
					--blue-hover-border: 1px solid rgba(54, 69, 217, 1);
				}

				:host>a, :host>button, :host>div {
					box-sizing: border-box;
					padding: 16px;
					display: block;
					border-radius: 8px;
					border: 1px solid rgba(35, 38, 45, 1);
					color: rgba(191, 193, 201, 1);
					text-decoration: none;
					background-color: #13151A;
					box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.10), 0px 4px 4px 0px rgba(0, 0, 0, 0.09), 0px 10px 6px 0px rgba(0, 0, 0, 0.05), 0px 17px 7px 0px rgba(0, 0, 0, 0.01), 0px 26px 7px 0px rgba(0, 0, 0, 0.00);
					width: 100%;
    			height: 100%;
				}

				h1, h2, h3, h4, h5, h6 {
					color: #fff;
					font-weight: 600;
				}

				a:hover, button:hover {
					background: var(--hover-background);
					border: var(--hover-border);
				}

				svg {
					display: block;
					margin: 0 auto;
				}

				span {
					margin-top: 8px;
					display: block;
					text-align: center;
				}
			</style>
			<style id="selected-style"></style>

			<${element}${this.link ? ` href="${this.link}" target="_blank"` : ``} id="astro-overlay-card">
				<slot />
			</${element}>
		`;

		this.updateStyle();

		if (this.clickAction) {
			this.shadowRoot
				.getElementById('astro-overlay-card')
				?.addEventListener('click', this.clickAction);
		}
	}
}

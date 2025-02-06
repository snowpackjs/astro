export class DevToolbarAuditListItem extends HTMLElement {
	clickAction?: () => void | (() => Promise<void>);
	shadowRoot: ShadowRoot;
	isManualFocus: boolean;

	constructor() {
		super();
		this.shadowRoot = this.attachShadow({ mode: 'open' });
		this.isManualFocus = false;

		this.shadowRoot.innerHTML = `
			<style>
				:host>button, :host>div {
					box-sizing: border-box;
					padding: 16px;
					background: transparent;
					border: none;
					border-bottom: 1px solid #1F2433;
					text-decoration: none;
					width: 100%;
	    		height: 100%;
				}

				h1, h2, h3, h4, h5, h6 {
					color: #fff;
					font-weight: 600;
				}

				:host>button:hover, :host([hovered])>button {
					background: #FFFFFF20;
				}

				svg {
					display: block;
					margin: 0 auto;
				}

			:host>button#astro-overlay-card {
			  text-align: left;
				box-shadow: none;
				display: flex;
				align-items: center;
				overflow: hidden;
				gap: 8px;
			}

			:host(:not([active]))>button:hover {
			  cursor: pointer;
			}

			.extended-info {
				display: none;
				color: white;
				font-size: 14px;
			}

			.extended-info hr {
				border: 1px solid rgba(27, 30, 36, 1);
			}

			:host([active]) .extended-info {
				display: block;
				position: absolute;
				height: 100%;
				top: 98px;
				height: calc(100% - 98px);
				background: #0d0e12;
				user-select: text;
				overflow: auto;
				border: none;
				z-index: 1000000000;
				flex-direction: column;
				line-height: 1.25rem;
			}

			:host([active])>button#astro-overlay-card {
				display: none;
			}

			.audit-title {
				margin: 0;
				margin-bottom: 4px;
			}

			.extended-info .audit-selector {
				font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
				display: flex;
				align-items: center;
				border-bottom: 1px solid transparent;
				user-select: none;
				color: rgba(191, 193, 201, 1);
			}

			.extended-info .audit-selector:hover {
				border-bottom: 1px solid rgba(255, 255, 255);
				cursor: pointer;
				color: #fff;
			}

			.audit-selector svg {
				width: 16px;
				height: 16px;
    		display: inline;
			}

			.extended-info .audit-description {
				color: rgba(191, 193, 201, 1);
			}

			.extended-info code {
				padding: 1px 3px;
				border-radius: 3px;
				background: #1F2433;
			}

			.reset-button {
				text-align: left;
				border: none;
				margin: 0;
				width: auto;
				overflow: visible;
				background: transparent;
				font: inherit;
				line-height: normal;
				-webkit-font-smoothing: inherit;
				-moz-osx-font-smoothing: inherit;
				-webkit-appearance: none;
				padding: 0;
				color: white;
			}
			</style>

			<button id="astro-overlay-card">
				<slot />
			</button>
		`;
	}

	connectedCallback() {
		if (this.clickAction) {
			this.shadowRoot
				.getElementById('astro-overlay-card')
				?.addEventListener('click', this.clickAction);
		}
	}
}

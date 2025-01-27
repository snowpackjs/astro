// @ts-expect-error - This module is private and untyped
import { loadDevToolbarApps } from 'astro:toolbar:internal';
import type { ResolvedDevToolbarApp as DevToolbarAppDefinition } from '../../../types/public/toolbar.js';
import { ToolbarAppEventTarget } from './helpers.js';
import { settings } from './settings.js';
import type { AstroDevToolbar, DevToolbarApp } from './toolbar.js';

let overlay: AstroDevToolbar;

document.addEventListener('DOMContentLoaded', async () => {
	const [
		customAppsDefinitions,
		{ default: astroDevToolApp },
		{ default: astroAuditApp },
		{ default: astroXrayApp },
		{ default: astroSettingsApp },
		{ AstroDevToolbar, DevToolbarCanvas, getAppIcon },
		{
			DevToolbarCard,
			DevToolbarHighlight,
			DevToolbarTooltip,
			DevToolbarWindow,
			DevToolbarToggle,
			DevToolbarButton,
			DevToolbarBadge,
			DevToolbarIcon,
			DevToolbarSelect,
			DevToolbarRadioCheckbox,
		},
	] = await Promise.all([
		loadDevToolbarApps() as DevToolbarAppDefinition[],
		import('./apps/astro.js'),
		import('./apps/audit/index.js'),
		import('./apps/xray.js'),
		import('./apps/settings.js'),
		import('./toolbar.js'),
		import('./ui-library/index.js'),
	]);

	// Register custom elements
	customElements.define('astro-dev-toolbar', AstroDevToolbar);
	customElements.define('astro-dev-toolbar-window', DevToolbarWindow);
	customElements.define('astro-dev-toolbar-app-canvas', DevToolbarCanvas);
	customElements.define('astro-dev-toolbar-tooltip', DevToolbarTooltip);
	customElements.define('astro-dev-toolbar-highlight', DevToolbarHighlight);
	customElements.define('astro-dev-toolbar-card', DevToolbarCard);
	customElements.define('astro-dev-toolbar-toggle', DevToolbarToggle);
	customElements.define('astro-dev-toolbar-button', DevToolbarButton);
	customElements.define('astro-dev-toolbar-badge', DevToolbarBadge);
	customElements.define('astro-dev-toolbar-icon', DevToolbarIcon);
	customElements.define('astro-dev-toolbar-select', DevToolbarSelect);
	customElements.define('astro-dev-toolbar-radio-checkbox', DevToolbarRadioCheckbox);

	overlay = document.createElement('astro-dev-toolbar');

	const notificationLevels = ['error', 'warning', 'info'] as const;
	const notificationSVGs: Record<(typeof notificationLevels)[number], string> = {
		error:
			'<svg viewBox="0 0 10 10" style="--fill:var(--fill-default);--fill-default:#B33E66;--fill-hover:#E3AFC1;"><rect width="9" height="9" x=".5" y=".5" fill="var(--fill)" stroke="#13151A" stroke-width="2" rx="4.5"/></svg>',
		warning:
			'<svg width="12" height="10" fill="none" style="--fill:var(--fill-default);--fill-default:#B58A2D;--fill-hover:#D5B776;"><path fill="var(--fill)" stroke="#13151A" stroke-width="2" d="M7.29904 1.25c-.57735-1-2.02073-1-2.59808 0l-3.4641 6C.65951 8.25 1.3812 9.5 2.5359 9.5h6.9282c1.1547 0 1.8764-1.25 1.299-2.25l-3.46406-6Z"/></svg>',
		info: '<svg viewBox="0 0 10 10" style="--fill:var(--fill-default);--fill-default:#3645D9;--fill-hover:#BDC3FF;"><rect width="9" height="9" x=".5" y=".5" fill="var(--fill)" stroke="#13151A" stroke-width="2" rx="1.5"/></svg>',
	} as const;

	const prepareApp = (appDefinition: DevToolbarAppDefinition, builtIn: boolean): DevToolbarApp => {
		const eventTarget = new ToolbarAppEventTarget();
		const app: DevToolbarApp = {
			...appDefinition,
			builtIn: builtIn,
			active: false,
			status: 'loading',
			notification: { state: false, level: undefined },
			eventTarget: eventTarget,
		};

		// Events apps can send to the overlay to update their status
		eventTarget.addEventListener('toggle-notification', (evt) => {
			if (!(evt instanceof CustomEvent)) return;

			const target = overlay.shadowRoot?.querySelector(`[data-app-id="${app.id}"]`);
			if (!target) return;
			const notificationElement = target.querySelector('.notification');
			if (!notificationElement) return;

			let newState = evt.detail.state ?? true;
			let level = notificationLevels.includes(evt?.detail?.level)
				? (evt.detail.level as (typeof notificationLevels)[number])
				: 'error';

			app.notification.state = newState;
			if (newState) app.notification.level = level;

			notificationElement.toggleAttribute('data-active', newState);
			if (newState) {
				notificationElement.setAttribute('data-level', level);
				notificationElement.innerHTML = notificationSVGs[level];
			}
		});

		const onToggleApp = async (evt: Event) => {
			let newState = undefined;
			if (evt instanceof CustomEvent) {
				newState = evt.detail.state ?? true;
			}

			await overlay.setAppStatus(app, newState);
		};

		eventTarget.addEventListener('toggle-app', onToggleApp);

		return app;
	};

	const astroMoreApp = {
		id: 'astro:more',
		name: 'More',
		icon: 'dots-three',
		init(canvas, eventTarget) {
			const hiddenApps = apps.filter((p) => !p.builtIn).slice(overlay.customAppsToShow);

			createDropdown();

			document.addEventListener('astro:after-swap', createDropdown);

			function createDropdown() {
				const style = document.createElement('style');
				style.innerHTML = `
					#dropdown {
						background: rgba(19, 21, 26, 1);
						border: 1px solid rgba(52, 56, 65, 1);
						border-radius: 12px;
						box-shadow: 0px 0px 0px 0px rgba(19, 21, 26, 0.30), 0px 1px 2px 0px rgba(19, 21, 26, 0.29), 0px 4px 4px 0px rgba(19, 21, 26, 0.26), 0px 10px 6px 0px rgba(19, 21, 26, 0.15), 0px 17px 7px 0px rgba(19, 21, 26, 0.04), 0px 26px 7px 0px rgba(19, 21, 26, 0.01);
						width: 192px;
						padding: 8px;
						z-index: 2000000010;
						transform: translate(-50%, 0%);
						position: fixed;
						bottom: 72px;
						left: 50%;
					}

					.notification {
						display: none;
						position: absolute;
						top: -4px;
						right: -5px;
						width: 12px;
						height: 10px;
					}

					.notification svg {
						display: block;
					}

					#dropdown:not([data-no-notification]) .notification[data-active] {
						display: block;
					}

					#dropdown button {
						border: 0;
						background: transparent;
						color: white;
						font-family: system-ui, sans-serif;
						font-size: 14px;
						white-space: nowrap;
						text-decoration: none;
						margin: 0;
						display: flex;
						align-items: center;
						width: 100%;
						padding: 8px;
						border-radius: 8px;
					}

					#dropdown button:hover, #dropdown button:focus-visible {
						background: #FFFFFF20;
						cursor: pointer;
					}

					#dropdown button.active {
						background: rgba(71, 78, 94, 1);
					}

					#dropdown .icon {
						position: relative;
						height: 20px;
						width: 20px;
						padding: 1px;
						margin-right: 0.5em;
					}

					#dropdown .icon svg {
						max-height: 100%;
						max-width: 100%;
					}
				`;
				canvas.append(style);

				const dropdown = document.createElement('div');
				dropdown.id = 'dropdown';
				dropdown.toggleAttribute('data-no-notification', settings.config.disableAppNotification);

				for (const app of hiddenApps) {
					const buttonContainer = document.createElement('div');
					buttonContainer.classList.add('item');
					const button = document.createElement('button');
					button.setAttribute('data-app-id', app.id);

					const iconContainer = document.createElement('div');
					const iconElement = document.createElement('template');
					iconElement.innerHTML = app.icon ? getAppIcon(app.icon) : '?';
					iconContainer.append(iconElement.content.cloneNode(true));

					const notification = document.createElement('div');
					notification.classList.add('notification');
					iconContainer.append(notification);
					iconContainer.classList.add('icon');

					button.append(iconContainer);
					button.append(document.createTextNode(app.name));

					button.addEventListener('click', () => {
						overlay.toggleAppStatus(app);
					});
					buttonContainer.append(button);

					dropdown.append(buttonContainer);

					app.eventTarget.addEventListener('toggle-notification', (evt) => {
						if (!(evt instanceof CustomEvent)) return;

						let newState = evt.detail.state ?? true;
						let level = notificationLevels.includes(evt?.detail?.level)
							? (evt.detail.level as (typeof notificationLevels)[number])
							: 'error';

						notification.toggleAttribute('data-active', newState);

						if (newState) {
							notification.setAttribute('data-level', level);
							notification.innerHTML = notificationSVGs[level];
						}

						app.notification.state = newState;
						if (newState) app.notification.level = level;

						eventTarget.dispatchEvent(
							new CustomEvent('toggle-notification', {
								detail: {
									state: hiddenApps.some((p) => p.notification.state === true),
									level:
										['error', 'warning', 'info'].find((notificationLevel) =>
											hiddenApps.some(
												(p) =>
													p.notification.state === true &&
													p.notification.level === notificationLevel,
											),
										) ?? 'error',
								},
							}),
						);
					});
				}

				canvas.append(dropdown);
			}
		},
	} satisfies DevToolbarAppDefinition;

	const apps: DevToolbarApp[] = [
		...[astroDevToolApp, astroXrayApp, astroAuditApp, astroSettingsApp, astroMoreApp].map(
			(appDef) => prepareApp(appDef, true),
		),
		...customAppsDefinitions.map((appDef) => prepareApp(appDef, false)),
	];

	overlay.apps = apps;

	document.body.append(overlay);

	document.addEventListener('astro:after-swap', () => {
		document.body.append(overlay);
	});
});

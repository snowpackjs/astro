import type { ResolvedDevToolbarApp } from '../../../../types/public/toolbar.js';
import { type Settings, settings } from '../settings.js';
import { isValidPlacement, placements } from '../ui-library/window.js';
import {
	closeOnOutsideClick,
	createWindowElement,
	synchronizePlacementOnUpdate,
} from './utils/window.js';

interface SettingRow {
	name: string;
	description: string;
	input: 'checkbox' | 'text' | 'number' | 'select';
	settingKey: keyof Settings;
	changeEvent: (evt: Event) => void;
}

const settingsRows = [
	{
		name: 'Disable notifications',
		description: 'Hide notification badges in the toolbar.',
		input: 'checkbox',
		settingKey: 'disableAppNotification',
		changeEvent: (evt: Event) => {
			if (evt.currentTarget instanceof HTMLInputElement) {
				const devToolbar = document.querySelector('astro-dev-toolbar');

				if (devToolbar) {
					devToolbar.setNotificationVisible(!evt.currentTarget.checked);
				}

				settings.updateSetting('disableAppNotification', evt.currentTarget.checked);
				const action = evt.currentTarget.checked ? 'disabled' : 'enabled';
				settings.logger.verboseLog(`App notification badges ${action}`);
			}
		},
	},
	{
		name: 'Verbose logging',
		description: 'Logs dev toolbar events in the browser console.',
		input: 'checkbox',
		settingKey: 'verbose',
		changeEvent: (evt: Event) => {
			if (evt.currentTarget instanceof HTMLInputElement) {
				settings.updateSetting('verbose', evt.currentTarget.checked);
				const action = evt.currentTarget.checked ? 'enabled' : 'disabled';
				settings.logger.verboseLog(`Verbose logging ${action}`);
			}
		},
	},
	{
		name: 'Placement',
		description: 'Adjust the placement of the dev toolbar.',
		input: 'select',
		settingKey: 'placement',
		changeEvent: (evt: Event) => {
			if (evt.currentTarget instanceof HTMLSelectElement) {
				const placement = evt.currentTarget.value;
				if (isValidPlacement(placement)) {
					document.querySelector('astro-dev-toolbar')?.setToolbarPlacement(placement);
					settings.updateSetting('placement', placement);
					settings.logger.verboseLog(`Placement set to ${placement}`);
				}
			}
		},
	},
] satisfies SettingRow[];

export default {
	id: 'astro:settings',
	name: 'Settings',
	icon: 'gear',
	init(canvas, eventTarget) {
		createSettingsWindow();

		document.addEventListener('astro:after-swap', createSettingsWindow);

		closeOnOutsideClick(eventTarget);
		synchronizePlacementOnUpdate(eventTarget, canvas);

		function createSettingsWindow() {
			const windowElement = createWindowElement(
				`<style>
					:host astro-dev-toolbar-window {
						height: 480px;

						--color-purple: rgba(224, 204, 250, 1);
					}
					header {
						display: flex;
					}

					h2, h3 {
						margin-top: 0;
					}

					.setting-row {
						display: flex;
						justify-content: space-between;
						align-items: center;
					}

					h3 {
						font-size: 16px;
						font-weight: 400;
						color: white;
						margin-bottom: 4px;
					}

					label {
						font-size: 14px;
						line-height: 1.5rem;
					}

					h1 {
						display: flex;
						align-items: center;
						gap: 8px;
						font-weight: 600;
						color: #fff;
						margin: 0;
						font-size: 22px;
					}

					astro-dev-toolbar-icon {
						width: 1em;
   					height: 1em;
    				display: block;
					}

					code {
						color: var(--color-purple);
						border-color: #343841;
						border-style: solid;
						border-width: 1px;
						border-radius: .4em;
						background-color: #24262D;
						padding: .3em;
					}

					label > section {
						max-width: 67%;
					}
					p {
						line-height: 1.5em;
					}
					a, a:visited {
						color: var(--color-purple);
					}
					a:hover {
						color: #f4ecfd;
					}
				</style>
				<header>
					<h1><astro-dev-toolbar-icon icon="gear"></astro-dev-toolbar-icon> Settings</h1>
				</header>

				<hr id="general"/>

				<label class="setting-row">
					<section>
						<h3>Hide toolbar</h3>
						Run <code>astro preferences disable devToolbar</code> in your terminal to disable the toolbar. <a href="https://docs.astro.build/en/reference/cli-reference/#astro-preferences" target="_blank">Learn more</a>.
					</section>
				</label>
				`,
			);
			const general = windowElement.querySelector('#general')!;
			for (const settingsRow of settingsRows) {
				general.after(document.createElement('hr'));
				general.after(getElementForSettingAsString(settingsRow));
			}
			canvas.append(windowElement);

			function getElementForSettingAsString(setting: SettingRow) {
				const label = document.createElement('label');
				label.classList.add('setting-row');
				const section = document.createElement('section');
				section.innerHTML = `<h3>${setting.name}</h3>${setting.description}`;
				label.append(section);

				switch (setting.input) {
					case 'checkbox': {
						const astroToggle = document.createElement('astro-dev-toolbar-toggle');
						astroToggle.input.addEventListener('change', setting.changeEvent);
						astroToggle.input.checked = settings.config[setting.settingKey] as boolean;
						label.append(astroToggle);
						break;
					}
					case 'select': {
						const astroSelect = document.createElement('astro-dev-toolbar-select');
						placements.forEach((placement) => {
							const option = document.createElement('option');
							option.setAttribute('value', placement);
							if (placement === settings.config[setting.settingKey]) {
								option.selected = true;
							}
							option.textContent = `${placement.slice(0, 1).toUpperCase()}${placement.slice(
								1,
							)}`.replace('-', ' ');
							astroSelect.append(option);
						});
						astroSelect.element.addEventListener('change', setting.changeEvent);
						label.append(astroSelect);
						break;
					}
					case 'number':
					case 'text':
					default:
						break;
				}

				return label;
			}
		}
	},
} satisfies ResolvedDevToolbarApp;

import type { Placement } from './ui-library/window.js';

export interface Settings {
	disableAppNotification: boolean;
	verbose: boolean;
	placement: Placement;
}

export const defaultSettings = {
	disableAppNotification: false,
	verbose: false,
	placement: 'bottom-center',
} satisfies Settings;

export const settings = getSettings();

function getSettings() {
	let _settings: Settings = { ...defaultSettings };
	const toolbarSettings = localStorage.getItem('astro:dev-toolbar:settings');

	if (toolbarSettings) {
		_settings = { ..._settings, ...JSON.parse(toolbarSettings) };
	}

	function updateSetting<Key extends keyof Settings>(key: Key, value: Settings[Key]) {
		_settings[key] = value;
		localStorage.setItem('astro:dev-toolbar:settings', JSON.stringify(_settings));
	}

	function log(message: string, level: 'log' | 'warn' | 'error' = 'log') {
		console[level](
			`%cAstro`,
			'background: linear-gradient(66.77deg, #D83333 0%, #F041FF 100%); color: white; padding-inline: 4px; border-radius: 2px; font-family: monospace;',
			message,
		);
	}

	return {
		get config() {
			return _settings;
		},
		updateSetting,
		logger: {
			log,
			warn: (message: string) => {
				log(message, 'warn');
			},
			error: (message: string) => {
				log(message, 'error');
			},
			verboseLog: (message: string) => {
				if (_settings.verbose) {
					log(message);
				}
			},
		},
	};
}

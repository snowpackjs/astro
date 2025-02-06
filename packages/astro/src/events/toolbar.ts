const EVENT_TOOLBAR_APP_TOGGLED = 'ASTRO_TOOLBAR_APP_TOGGLED';

interface AppToggledEventPayload {
	app: string;
}

export function eventAppToggled(options: {
	appName: 'other' | (string & {});
}): { eventName: string; payload: AppToggledEventPayload }[] {
	const payload: AppToggledEventPayload = {
		app: options.appName,
	};

	return [{ eventName: EVENT_TOOLBAR_APP_TOGGLED, payload }];
}

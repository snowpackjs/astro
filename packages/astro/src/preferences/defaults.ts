export const DEFAULT_PREFERENCES = {
	devToolbar: {
		/** Specifies whether the user has the Dev Overlay enabled */
		enabled: true,
	},
	checkUpdates: {
		/** Specifies whether the user has the update check enabled */
		enabled: true,
	},
	// Temporary variables that shouldn't be exposed to the users in the CLI, but are still useful to store in preferences
	_variables: {
		/** Time since last update check */
		lastUpdateCheck: 0,
	},
};

export type Preferences = typeof DEFAULT_PREFERENCES;
export type PublicPreferences = Omit<Preferences, '_variables'>;

import { version as ReactVersion } from 'react-dom';

export type SupportedReactVersion = keyof typeof versionsConfig;
export type ReactVersionConfig = (typeof versionsConfig)[SupportedReactVersion];

export function getReactMajorVersion(): number {
	const matches = /\d+\./.exec(ReactVersion);
	if (!matches) {
		return NaN;
	}
	return Number(matches[0]);
}

export function isUnsupportedVersion(majorVersion: number) {
	return majorVersion < 17 || majorVersion > 19 || Number.isNaN(majorVersion);
}

export const versionsConfig = {
	17: {
		server: '@astrojs/react/server-v17.js',
		client: '@astrojs/react/client-v17.js',
	},
	18: {
		server: '@astrojs/react/server.js',
		client: '@astrojs/react/client.js',
	},
	19: {
		server: '@astrojs/react/server.js',
		client: '@astrojs/react/client.js',
	},
};

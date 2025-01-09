import { createRequire } from 'node:module';

export type SupportedReactVersion = keyof typeof versionsConfig;
export type ReactVersionConfig = (typeof versionsConfig)[SupportedReactVersion];

export function getReactMajorVersion(): number {
	// NOTE: Do not import `version` from `react-dom` because in 2025 React 19 still relies on
	// `process.env.NODE_ENV` to determine export dev or prod code, and if we import `react-dom`
	// too early (e.g. in the astro config) before we set `process.env.NODE_ENV`, it may reference
	// the dev code, and then `react` will reference the prod code, and we get a mismatch of
	// `TypeError: dispatcher.getOwner is not a function`
	const pkgJson = createRequire(import.meta.url)('react-dom/package.json');
	const matches = /\d+\./.exec(pkgJson.version);
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
		externals: ['react-dom/server.js', 'react-dom/client.js'],
	},
	18: {
		server: '@astrojs/react/server.js',
		client: '@astrojs/react/client.js',
		externals: ['react-dom/server', 'react-dom/client'],
	},
	19: {
		server: '@astrojs/react/server.js',
		client: '@astrojs/react/client.js',
		externals: ['react-dom/server', 'react-dom/client'],
	},
};

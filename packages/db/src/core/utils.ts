import { type ManagedAppToken, getAstroStudioEnv, getManagedAppTokenOrExit } from '@astrojs/studio';
import type { AstroConfig, AstroIntegration } from 'astro';
import { loadEnv } from 'vite';
import './types.js';

export type VitePlugin = Required<AstroConfig['vite']>['plugins'][number];

export function getAstroEnv(envMode = ''): Record<`ASTRO_${string}`, string> {
	const env = loadEnv(envMode, process.cwd(), 'ASTRO_');
	return env;
}

export type RemoteDatabaseInfo = {
	type: 'libsql' | 'studio';
	url: string;
};

export function getRemoteDatabaseInfo(): RemoteDatabaseInfo {
	const astroEnv = getAstroEnv();
	const studioEnv = getAstroStudioEnv();

	if (studioEnv.ASTRO_STUDIO_REMOTE_DB_URL)
		return {
			type: 'studio',
			url: studioEnv.ASTRO_STUDIO_REMOTE_DB_URL,
		};

	if (astroEnv.ASTRO_DB_REMOTE_URL)
		return {
			type: 'libsql',
			url: astroEnv.ASTRO_DB_REMOTE_URL,
		};

	return {
		type: 'studio',
		url: 'https://db.services.astro.build',
	};
}

export function getManagedRemoteToken(
	token?: string,
	dbInfo?: RemoteDatabaseInfo,
): Promise<ManagedAppToken> {
	dbInfo ??= getRemoteDatabaseInfo();

	if (dbInfo.type === 'studio') {
		return getManagedAppTokenOrExit(token);
	}

	const astroEnv = getAstroEnv();

	return Promise.resolve({
		token: token ?? astroEnv.ASTRO_DB_APP_TOKEN,
		renew: () => Promise.resolve(),
		destroy: () => Promise.resolve(),
	});
}

export function getDbDirectoryUrl(root: URL | string) {
	return new URL('db/', root);
}

export function defineDbIntegration(integration: AstroIntegration): AstroIntegration {
	return integration;
}

export type Result<T> = { success: true; data: T } | { success: false; data: unknown };

/**
 * Map an object's values to a new set of values
 * while preserving types.
 */
export function mapObject<T, U = T>(
	item: Record<string, T>,
	callback: (key: string, value: T) => U,
): Record<string, U> {
	return Object.fromEntries(
		Object.entries(item).map(([key, value]) => [key, callback(key, value)]),
	);
}

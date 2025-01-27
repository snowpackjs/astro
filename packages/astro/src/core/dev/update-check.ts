import ci from 'ci-info';
import { fetchPackageJson } from '../../cli/install-package.js';
import type { AstroPreferences } from '../../preferences/index.js';

export const MAX_PATCH_DISTANCE = 5; // If the patch distance is less than this, don't bother the user
const CHECK_MS_INTERVAL = 1_036_800_000; // 12 days, give or take

let _latestVersion: string | undefined = undefined;

export async function fetchLatestAstroVersion(
	preferences: AstroPreferences | undefined,
): Promise<string> {
	if (_latestVersion) {
		return _latestVersion;
	}

	const packageJson = await fetchPackageJson(undefined, 'astro', 'latest');
	if (packageJson instanceof Error) {
		throw packageJson;
	}

	const version = packageJson?.version;

	if (!version) {
		throw new Error('Failed to fetch latest Astro version');
	}

	if (preferences) {
		await preferences.set('_variables.lastUpdateCheck', Date.now(), { reloadServer: false });
	}

	_latestVersion = version;
	return version;
}

export async function shouldCheckForUpdates(preferences: AstroPreferences): Promise<boolean> {
	if (ci.isCI) {
		return false;
	}

	const timeSinceLastCheck = Date.now() - (await preferences.get('_variables.lastUpdateCheck'));
	const hasCheckUpdatesEnabled = await preferences.get('checkUpdates.enabled');

	return (
		timeSinceLastCheck > CHECK_MS_INTERVAL &&
		process.env.ASTRO_DISABLE_UPDATE_CHECK !== 'true' &&
		hasCheckUpdatesEnabled
	);
}

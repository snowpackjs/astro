import type { Context, PackageInfo } from './context.js';

import dns from 'node:dns/promises';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { color } from '@astrojs/cli-kit';
import semverCoerce from 'semver/functions/coerce.js';
import semverDiff from 'semver/functions/diff.js';
import semverParse from 'semver/functions/parse.js';
import { bannerAbort, error, getRegistry, info, newline } from '../messages.js';

export async function verify(
	ctx: Pick<Context, 'version' | 'packages' | 'cwd' | 'dryRun' | 'exit'>,
) {
	const registry = await getRegistry();

	if (!ctx.dryRun) {
		const online = await isOnline(registry);
		if (!online) {
			bannerAbort();
			newline();
			error('error', `Unable to connect to the internet.`);
			ctx.exit(1);
		}
	}

	const isAstroProject = await verifyAstroProject(ctx);
	if (!isAstroProject) {
		bannerAbort();
		newline();
		error('error', `Astro installation not found in the current directory.`);
		ctx.exit(1);
	}

	const ok = await verifyVersions(ctx, registry);
	if (!ok) {
		bannerAbort();
		newline();
		error('error', `Version ${color.reset(ctx.version)} ${color.dim('could not be found!')}`);
		await info('check', 'https://github.com/withastro/astro/releases');
		ctx.exit(1);
	}
}

function isOnline(registry: string): Promise<boolean> {
	const { hostname } = new URL(registry);
	return dns.lookup(hostname).then(
		() => true,
		() => false,
	);
}

function safeJSONParse(value: string) {
	try {
		return JSON.parse(value);
	} catch {}
	return {};
}

async function verifyAstroProject(ctx: Pick<Context, 'cwd' | 'version' | 'packages'>) {
	const packageJson = new URL('./package.json', ctx.cwd);
	if (!existsSync(packageJson)) return false;
	const contents = await readFile(packageJson, { encoding: 'utf-8' });
	if (!contents.includes('astro')) return false;

	const { dependencies = {}, devDependencies = {} } = safeJSONParse(contents);
	if (dependencies['astro'] === undefined && devDependencies['astro'] === undefined) return false;

	// Side-effect! Persist dependency info to the shared context
	collectPackageInfo(ctx, dependencies, devDependencies);

	return true;
}

function isAstroPackage(name: string, _version: string) {
	return name === 'astro' || name.startsWith('@astrojs/');
}

function isAllowedPackage(name: string, _version: string) {
	return name !== '@astrojs/upgrade';
}

function isValidVersion(_name: string, version: string) {
	return semverCoerce(version, { loose: true }) !== null;
}

function isSupportedPackage(name: string, version: string): boolean {
	for (const validator of [isAstroPackage, isAllowedPackage, isValidVersion]) {
		if (!validator(name, version)) return false;
	}
	return true;
}

export function collectPackageInfo(
	ctx: Pick<Context, 'version' | 'packages'>,
	dependencies: Record<string, string> = {},
	devDependencies: Record<string, string> = {},
) {
	for (const [name, currentVersion] of Object.entries(dependencies)) {
		if (!isSupportedPackage(name, currentVersion)) continue;
		ctx.packages.push({
			name,
			currentVersion,
			targetVersion: ctx.version,
		});
	}
	for (const [name, currentVersion] of Object.entries(devDependencies)) {
		if (!isSupportedPackage(name, currentVersion)) continue;
		ctx.packages.push({
			name,
			currentVersion,
			targetVersion: ctx.version,
			isDevDependency: true,
		});
	}
}

async function verifyVersions(
	ctx: Pick<Context, 'version' | 'packages' | 'exit'>,
	registry: string,
) {
	const tasks: Promise<void>[] = [];
	for (const packageInfo of ctx.packages) {
		tasks.push(resolveTargetVersion(packageInfo, registry));
	}
	try {
		await Promise.all(tasks);
	} catch {
		return false;
	}
	for (const packageInfo of ctx.packages) {
		if (!packageInfo.targetVersion) {
			return false;
		}
	}
	return true;
}

async function resolveTargetVersion(packageInfo: PackageInfo, registry: string): Promise<void> {
	const packageMetadata = await fetch(`${registry}/${packageInfo.name}`, {
		headers: { accept: 'application/vnd.npm.install-v1+json' },
	});
	if (packageMetadata.status >= 400) {
		throw new Error(`Unable to resolve "${packageInfo.name}"`);
	}
	const { 'dist-tags': distTags } = await packageMetadata.json();
	let version = distTags[packageInfo.targetVersion];
	if (version) {
		packageInfo.tag = packageInfo.targetVersion;
		packageInfo.targetVersion = version;
	} else {
		packageInfo.targetVersion = 'latest';
		version = distTags.latest;
	}
	if (packageInfo.currentVersion === version) {
		return;
	}
	const prefix = packageInfo.targetVersion === 'latest' ? '^' : '';
	packageInfo.targetVersion = `${prefix}${version}`;
	const fromVersion = semverCoerce(packageInfo.currentVersion)!;
	const toVersion = semverParse(version)!;
	const bump = semverDiff(fromVersion, toVersion);
	if ((bump === 'major' && toVersion.prerelease.length === 0) || bump === 'premajor') {
		packageInfo.isMajor = true;
		if (packageInfo.name === 'astro') {
			const upgradeGuide = `https://docs.astro.build/en/guides/upgrade-to/v${toVersion.major}/`;
			const docsRes = await fetch(upgradeGuide);
			// OK if this request fails, it's probably a prerelease without a public migration guide.
			// In that case, we should fallback to the CHANGELOG check below.
			if (docsRes.status === 200) {
				packageInfo.changelogURL = upgradeGuide;
				packageInfo.changelogTitle = `Upgrade to Astro v${toVersion.major}`;
				return;
			}
		}
		const latestMetadata = await fetch(`${registry}/${packageInfo.name}/latest`);
		if (latestMetadata.status >= 400) {
			throw new Error(`Unable to resolve "${packageInfo.name}"`);
		}
		const { repository } = await latestMetadata.json();
		const branch = bump === 'premajor' ? 'next' : 'main';
		packageInfo.changelogURL = extractChangelogURLFromRepository(repository, version, branch);
		packageInfo.changelogTitle = 'CHANGELOG';
	} else {
		// Dependency updates should not include the specific dist-tag
		// since they are just for compatibility
		packageInfo.tag = undefined;
	}
}

function extractChangelogURLFromRepository(
	repository: Record<string, string>,
	version: string,
	branch = 'main',
) {
	return (
		repository.url.replace('git+', '').replace('.git', '') +
		`/blob/${branch}/` +
		repository.directory +
		'/CHANGELOG.md#' +
		version.replace(/\./g, '')
	);
}

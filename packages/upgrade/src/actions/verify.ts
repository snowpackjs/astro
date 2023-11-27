import type { Context, PackageInfo } from './context.js';

import dns from 'node:dns/promises';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { color } from '@astrojs/cli-kit';
import { bannerAbort, error, getRegistry, info, log } from '../messages.js';
import semverDiff from 'semver/functions/diff.js';
import semverCoerce from 'semver/functions/coerce.js'


export async function verify(
	ctx: Pick<Context, 'version' | 'packages' | 'cwd' | 'dryRun' | 'exit'>
) {
	const registry = await getRegistry();

	if (!ctx.dryRun) {
		const online = await isOnline(registry);
		if (!online) {
			bannerAbort();
			log('');
			error('error', `Unable to connect to the internet.`);
			ctx.exit(1);
		}
	}

	await verifyAstroProject(ctx);

	const ok = await verifyVersions(ctx, registry);
	if (!ok) {
		bannerAbort();
		log('');
		error('error', `Version ${color.reset(ctx.version)} ${color.dim('could not be found!')}`);
		await info('check', 'https://github.com/withastro/astro/releases');
		ctx.exit(1);
	}
}

function isOnline(registry: string): Promise<boolean> {
	const { host } = new URL(registry);
	return dns.lookup(host).then(
		() => true,
		() => false
	);
}

function safeJSONParse(value: string) {
	try {
		return JSON.parse(value);
	} catch {}
	return {}
}

async function verifyAstroProject(ctx: Pick<Context, 'cwd' | 'version' | 'packages'>) {
	const packageJson = new URL('./package.json', ctx.cwd);
    if (!existsSync(packageJson)) return false;
	const contents = await readFile(packageJson, { encoding: 'utf-8' });
	if (!contents.includes('astro')) return false;

	const { dependencies = {}, devDependencies = {} } = safeJSONParse(contents)
	if (dependencies['astro'] === undefined && devDependencies['astro'] === undefined) return false;
	
	// Side-effect! Persist dependency info to the shared context
	collectPackageInfo(ctx, dependencies, devDependencies);
	
	return true;
}

function isAstroPackage(name: string) {
	return name === 'astro' || name.startsWith('@astrojs/');
}

function collectPackageInfo(ctx: Pick<Context, 'version' | 'packages'>, dependencies: Record<string, string>, devDependencies: Record<string, string>) {
	for (const [name, currentVersion] of Object.entries(dependencies)) {
		if (!isAstroPackage(name)) continue;
		ctx.packages.push({
			name,
			currentVersion,
			targetVersion: ctx.version,
		})
	}
	for (const [name, currentVersion] of Object.entries(devDependencies)) {
		if (!isAstroPackage(name)) continue;
		ctx.packages.push({
			name,
			currentVersion,
			targetVersion: ctx.version,
			isDevDependency: true
		})
	}
}

async function verifyVersions(ctx: Pick<Context, 'version' | 'packages'>, registry: string) {
	const tasks: Promise<void>[] = [];
	for (const packageInfo of ctx.packages) {
		tasks.push(resolveTargetVersion(packageInfo, registry));
	}
	await Promise.all(tasks);
	for (const packageInfo of ctx.packages) {
		if (!packageInfo.targetVersion) {
			return false;
		}
	}
	return true;
}

async function resolveTargetVersion(packageInfo: PackageInfo, registry: string): Promise<void> {
	const res = await fetch(`${registry}/${packageInfo.name}/${packageInfo.targetVersion}`);
	const { status } = res;
	if (status >= 400) {
		if (packageInfo.targetVersion === 'latest') {
			packageInfo.targetVersion = '';
			return;
		} else {
			// Mutate targetVersion so it is resolved properly elsewhere
			packageInfo.targetVersion = 'latest';
			return resolveTargetVersion(packageInfo, registry);
		}
	}
	const { version, repository } = await res.json()
	if (packageInfo.currentVersion === version) {
		return;
	}
	const prefix = packageInfo.targetVersion === 'latest' ? '^' : '';
	packageInfo.targetVersion = `${prefix}${version}`;
	const fromVersion = semverCoerce(packageInfo.currentVersion)!;
	const toVersion = semverCoerce(packageInfo.targetVersion)!;
	const bump = semverDiff(fromVersion, toVersion);
	if (bump === 'major') {
		packageInfo.isMajor = true;
		if (packageInfo.name === 'astro') {
			const upgradeGuide = `https://docs.astro.build/en/guides/upgrade-to/v${toVersion.major}/`;
			const docsRes = await fetch(upgradeGuide);
			if (docsRes.status === 200) {
				packageInfo.changelogURL = upgradeGuide;
				packageInfo.changelogTitle = `Upgrade to Astro v${toVersion.major}`;
				return;
			}
		}

		packageInfo.changelogURL = extractChangelogURLFromRepository(repository, version);
		packageInfo.changelogTitle = 'CHANGELOG';
	}
}

function extractChangelogURLFromRepository(repository: Record<string, string>, version: string) {
	return repository.url.replace('git+', '').replace('.git', '') + '/blob/main/' + repository.directory + '/CHANGELOG.md#' + version.replace(/\./g, '')
}


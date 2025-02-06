import { createRequire } from 'node:module';
import boxen from 'boxen';
import ci from 'ci-info';
import { bold, cyan, dim, magenta } from 'kleur/colors';
import preferredPM from 'preferred-pm';
import prompts from 'prompts';
import whichPm from 'which-pm';
import yoctoSpinner from 'yocto-spinner';
import type { Logger } from '../core/logger/core.js';
import { exec } from './exec.js';

const require = createRequire(import.meta.url);

type GetPackageOptions = {
	skipAsk?: boolean;
	optional?: boolean;
	cwd?: string;
};

export async function getPackage<T>(
	packageName: string,
	logger: Logger,
	options: GetPackageOptions,
	otherDeps: string[] = [],
): Promise<T | undefined> {
	try {
		// Try to resolve with `createRequire` first to prevent ESM caching of the package
		// if it errors and fails here
		require.resolve(packageName, { paths: [options.cwd ?? process.cwd()] });
		const packageImport = await import(packageName);
		return packageImport as T;
	} catch {
		if (options.optional) return undefined;
		let message = `To continue, Astro requires the following dependency to be installed: ${bold(
			packageName,
		)}.`;

		if (ci.isCI) {
			message += ` Packages cannot be installed automatically in CI environments.`;
		}

		logger.info('SKIP_FORMAT', message);

		if (ci.isCI) {
			return undefined;
		}

		const result = await installPackage([packageName, ...otherDeps], options, logger);

		if (result) {
			const packageImport = await import(packageName);
			return packageImport;
		} else {
			return undefined;
		}
	}
}

function getInstallCommand(packages: string[], packageManager: string) {
	switch (packageManager) {
		case 'npm':
			return { pm: 'npm', command: 'install', flags: [], dependencies: packages };
		case 'yarn':
			return { pm: 'yarn', command: 'add', flags: [], dependencies: packages };
		case 'pnpm':
			return { pm: 'pnpm', command: 'add', flags: [], dependencies: packages };
		case 'bun':
			return { pm: 'bun', command: 'add', flags: [], dependencies: packages };
		default:
			return null;
	}
}

/**
 * Get the command to execute and download a package (e.g. `npx`, `yarn dlx`, `pnpm dlx`, etc.)
 * @param packageManager - Optional package manager to use. If not provided, Astro will attempt to detect the preferred package manager.
 * @returns The command to execute and download a package
 */
export async function getExecCommand(packageManager?: string): Promise<string> {
	if (!packageManager) {
		packageManager = (await preferredPM(process.cwd()))?.name ?? 'npm';
	}

	switch (packageManager) {
		case 'npm':
			return 'npx';
		case 'yarn':
			return 'yarn dlx';
		case 'pnpm':
			return 'pnpm dlx';
		case 'bun':
			return 'bunx';
		default:
			return 'npx';
	}
}

async function installPackage(
	packageNames: string[],
	options: GetPackageOptions,
	logger: Logger,
): Promise<boolean> {
	const cwd = options.cwd ?? process.cwd();
	const packageManager = (await whichPm(cwd))?.name ?? 'npm';
	const installCommand = getInstallCommand(packageNames, packageManager);

	if (!installCommand) {
		return false;
	}

	const coloredOutput = `${bold(installCommand.pm)} ${installCommand.command}${[
		'',
		...installCommand.flags,
	].join(' ')} ${cyan(installCommand.dependencies.join(' '))}`;
	const message = `\n${boxen(coloredOutput, {
		margin: 0.5,
		padding: 0.5,
		borderStyle: 'round',
	})}\n`;
	logger.info(
		'SKIP_FORMAT',
		`\n  ${magenta('Astro will run the following command:')}\n  ${dim(
			'If you skip this step, you can always run it yourself later',
		)}\n${message}`,
	);

	let response;
	if (options.skipAsk) {
		response = true;
	} else {
		response = (
			await prompts({
				type: 'confirm',
				name: 'askToContinue',
				message: 'Continue?',
				initial: true,
			})
		).askToContinue;
	}

	if (Boolean(response)) {
		const spinner = yoctoSpinner({ text: 'Installing dependencies...' }).start();
		try {
			await exec(
				installCommand.pm,
				[installCommand.command, ...installCommand.flags, ...installCommand.dependencies],
				{
					nodeOptions: {
						cwd,
						// reset NODE_ENV to ensure install command run in dev mode
						env: { NODE_ENV: undefined },
					},
				},
			);
			spinner.success();

			return true;
		} catch (err) {
			logger.debug('add', 'Error installing dependencies', err);
			spinner.error();

			return false;
		}
	} else {
		return false;
	}
}

export async function fetchPackageJson(
	scope: string | undefined,
	name: string,
	tag: string,
): Promise<Record<string, any> | Error> {
	const packageName = `${scope ? `${scope}/` : ''}${name}`;
	const registry = await getRegistry();
	const res = await fetch(`${registry}/${packageName}/${tag}`);
	if (res.status >= 200 && res.status < 300) {
		return await res.json();
	} else if (res.status === 404) {
		// 404 means the package doesn't exist, so we don't need an error message here
		return new Error();
	} else {
		return new Error(`Failed to fetch ${registry}/${packageName}/${tag} - GET ${res.status}`);
	}
}

export async function fetchPackageVersions(packageName: string): Promise<string[] | Error> {
	const registry = await getRegistry();
	const res = await fetch(`${registry}/${packageName}`, {
		headers: { accept: 'application/vnd.npm.install-v1+json' },
	});
	if (res.status >= 200 && res.status < 300) {
		return await res.json().then((data) => Object.keys(data.versions));
	} else if (res.status === 404) {
		// 404 means the package doesn't exist, so we don't need an error message here
		return new Error();
	} else {
		return new Error(`Failed to fetch ${registry}/${packageName} - GET ${res.status}`);
	}
}

// Users might lack access to the global npm registry, this function
// checks the user's project type and will return the proper npm registry
//
// A copy of this function also exists in the create-astro package
let _registry: string;
async function getRegistry(): Promise<string> {
	if (_registry) return _registry;
	const fallback = 'https://registry.npmjs.org';
	const packageManager = (await preferredPM(process.cwd()))?.name || 'npm';
	try {
		const { stdout } = await exec(packageManager, ['config', 'get', 'registry']);
		_registry = stdout.trim()?.replace(/\/$/, '') || fallback;
		// Detect cases where the shell command returned a non-URL (e.g. a warning)
		if (!new URL(_registry).host) _registry = fallback;
	} catch {
		_registry = fallback;
	}
	return _registry;
}

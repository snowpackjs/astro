import fs from 'node:fs';
import path from 'node:path';
import { color } from '@astrojs/cli-kit';
import { error, info, title } from '../messages.js';
import { shell } from '../shell.js';
import type { Context } from './context.js';

export async function dependencies(
	ctx: Pick<
		Context,
		'install' | 'yes' | 'prompt' | 'packageManager' | 'cwd' | 'dryRun' | 'tasks' | 'add'
	>,
) {
	let deps = ctx.install ?? ctx.yes;
	if (deps === undefined) {
		({ deps } = await ctx.prompt({
			name: 'deps',
			type: 'confirm',
			label: title('deps'),
			message: `Install dependencies?`,
			hint: 'recommended',
			initial: true,
		}));
		ctx.install = deps;
	}

	ctx.add = ctx.add?.reduce<string[]>((acc, item) => acc.concat(item.split(',')), []);

	if (ctx.dryRun) {
		await info(
			'--dry-run',
			`Skipping dependency installation${ctx.add ? ` and adding ${ctx.add.join(', ')}` : ''}`,
		);
	} else if (deps) {
		ctx.tasks.push({
			pending: 'Dependencies',
			start: `Dependencies installing with ${ctx.packageManager}...`,
			end: 'Dependencies installed',
			onError: (e) => {
				error('error', e);
				error(
					'error',
					`Dependencies failed to install, please run ${color.bold(
						ctx.packageManager + ' install',
					)} to install them manually after setup.`,
				);
			},
			while: () => install({ packageManager: ctx.packageManager, cwd: ctx.cwd }),
		});

		let add = ctx.add;

		if (add) {
			ctx.tasks.push({
				pending: 'Integrations',
				start: `Adding integrations with astro add`,
				end: 'Integrations added',
				onError: (e) => {
					error('error', e);
					error(
						'error',
						`Failed to add integrations, please run ${color.bold(
							`astro add ${add.join(' ')}`,
						)} to install them manually after setup.`,
					);
				},
				while: () =>
					astroAdd({ integrations: add, packageManager: ctx.packageManager, cwd: ctx.cwd }),
			});
		}
	} else {
		await info(
			ctx.yes === false ? 'deps [skip]' : 'No problem!',
			'Remember to install dependencies after setup.',
		);
	}
}

async function astroAdd({
	integrations,
	packageManager,
	cwd,
}: { integrations: string[]; packageManager: string; cwd: string }) {
	if (packageManager === 'yarn') await ensureYarnLock({ cwd });
	return shell(
		packageManager === 'npm' ? 'npx' : `${packageManager} dlx`,
		['astro add', integrations.join(' '), '-y'],
		{ cwd, timeout: 90_000, stdio: 'ignore' },
	);
}

async function install({ packageManager, cwd }: { packageManager: string; cwd: string }) {
	if (packageManager === 'yarn') await ensureYarnLock({ cwd });
	return shell(packageManager, ['install'], { cwd, timeout: 90_000, stdio: 'ignore' });
}

/**
 * Yarn Berry (PnP) versions will throw an error if there isn't an existing `yarn.lock` file
 * If a `yarn.lock` file doesn't exist, this function writes an empty `yarn.lock` one.
 * Unfortunately this hack is required to run `yarn install`.
 *
 * The empty `yarn.lock` file is immediately overwritten by the installation process.
 * See https://github.com/withastro/astro/pull/8028
 */
async function ensureYarnLock({ cwd }: { cwd: string }) {
	const yarnLock = path.join(cwd, 'yarn.lock');
	if (fs.existsSync(yarnLock)) return;
	return fs.promises.writeFile(yarnLock, '', { encoding: 'utf-8' });
}

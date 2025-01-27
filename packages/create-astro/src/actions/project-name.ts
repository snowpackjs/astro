import type { Context } from './context.js';

import path from 'node:path';
import { color, generateProjectName } from '@astrojs/cli-kit';
import { info, log, title } from '../messages.js';

import { isEmpty, toValidName } from './shared.js';

export async function projectName(
	ctx: Pick<Context, 'cwd' | 'yes' | 'dryRun' | 'prompt' | 'projectName' | 'exit'>,
) {
	await checkCwd(ctx.cwd);

	if (!ctx.cwd || !isEmpty(ctx.cwd)) {
		if (!isEmpty(ctx.cwd)) {
			await info('Hmm...', `${color.reset(`"${ctx.cwd}"`)}${color.dim(` is not empty!`)}`);
		}

		if (ctx.yes) {
			ctx.projectName = generateProjectName();
			ctx.cwd = `./${ctx.projectName}`;
			await info('dir', `Project created at ./${ctx.projectName}`);
			return;
		}

		const { name } = await ctx.prompt({
			name: 'name',
			type: 'text',
			label: title('dir'),
			message: 'Where should we create your new project?',
			initial: `./${generateProjectName()}`,
			validate(value: string) {
				if (!isEmpty(value)) {
					return `Directory is not empty!`;
				}
				// Check for non-printable characters
				if (value.match(/[^\x20-\x7E]/g) !== null)
					return `Invalid non-printable character present!`;
				return true;
			},
		});

		ctx.cwd = name!.trim();
		ctx.projectName = toValidName(name!);
		if (ctx.dryRun) {
			await info('--dry-run', 'Skipping project naming');
			return;
		}
	} else {
		let name = ctx.cwd;
		if (name === '.' || name === './') {
			const parts = process.cwd().split(path.sep);
			name = parts[parts.length - 1];
		} else if (name.startsWith('./') || name.startsWith('../')) {
			const parts = name.split('/');
			name = parts[parts.length - 1];
		}
		ctx.projectName = toValidName(name);
	}

	if (!ctx.cwd) {
		ctx.exit(1);
	}
}

async function checkCwd(cwd: string | undefined) {
	const empty = cwd && isEmpty(cwd);
	if (empty) {
		log('');
		await info('dir', `Using ${color.reset(cwd)}${color.dim(' as project directory')}`);
	}

	return empty;
}

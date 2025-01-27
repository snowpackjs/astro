import { getContext } from './actions/context.js';

import { tasks } from '@astrojs/cli-kit';
import { dependencies } from './actions/dependencies.js';
import { git } from './actions/git.js';
import { help } from './actions/help.js';
import { intro } from './actions/intro.js';
import { next } from './actions/next-steps.js';
import { projectName } from './actions/project-name.js';
import { template } from './actions/template.js';
import { verify } from './actions/verify.js';
import { setStdout } from './messages.js';

const exit = () => process.exit(0);
process.on('SIGINT', exit);
process.on('SIGTERM', exit);

export async function main() {
	// Add some extra spacing from the noisy npm/pnpm init output
	// biome-ignore lint/suspicious/noConsoleLog: allowed
	console.log('');
	// NOTE: In the v7.x version of npm, the default behavior of `npm init` was changed
	// to no longer require `--` to pass args and instead pass `--` directly to us. This
	// broke our arg parser, since `--` is a special kind of flag. Filtering for `--` here
	// fixes the issue so that create-astro now works on all npm versions.
	const cleanArgv = process.argv.slice(2).filter((arg) => arg !== '--');
	const ctx = await getContext(cleanArgv);
	if (ctx.help) {
		help();
		return;
	}

	const steps = [
		verify,
		intro,
		projectName,
		template,
		dependencies,

		// Steps which write to files need to go above git
		git,
	];

	for (const step of steps) {
		await step(ctx);
	}

	// biome-ignore lint/suspicious/noConsoleLog: allowed
	console.log('');

	const labels = {
		start: 'Project initializing...',
		end: 'Project initialized!',
	};
	await tasks(labels, ctx.tasks);

	await next(ctx);

	process.exit(0);
}

export { dependencies, getContext, git, intro, next, projectName, setStdout, template, verify };

import { getContext } from './actions/context.js';

import { help } from './actions/help.js';
import { install } from './actions/install.js';
import { collectPackageInfo, verify } from './actions/verify.js';
import { setStdout } from './messages.js';

const exit = () => process.exit(0);
process.on('SIGINT', exit);
process.on('SIGTERM', exit);

export async function main() {
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

	const steps = [verify, install];

	for (const step of steps) {
		await step(ctx);
	}
	process.exit(0);
}

export { getContext, install, setStdout, verify, collectPackageInfo };

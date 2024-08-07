import _build from '../../core/build/index.js';
import { printHelp } from '../../core/messages.js';
import { type Flags, flagsToAstroInlineConfig } from '../flags.js';

interface BuildOptions {
	flags: Flags;
}

export async function build({ flags }: BuildOptions) {
	if (flags?.help || flags?.h) {
		printHelp({
			commandName: 'astro build',
			usage: '[...flags]',
			tables: {
				Flags: [
					['--outDir <directory>', `Specify the output directory for the build.`],
					['--help (-h)', 'See all available flags.'],
				],
			},
			description: `Builds your site for deployment.`,
		});
		return;
	}

	const inlineConfig = flagsToAstroInlineConfig(flags);

	await _build(inlineConfig, { force: !!flags.force });
}

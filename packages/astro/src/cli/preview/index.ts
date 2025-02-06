import { cyan } from 'kleur/colors';
import { printHelp } from '../../core/messages.js';
import previewServer from '../../core/preview/index.js';
import { type Flags, flagsToAstroInlineConfig } from '../flags.js';

interface PreviewOptions {
	flags: Flags;
}

export async function preview({ flags }: PreviewOptions) {
	if (flags?.help || flags?.h) {
		printHelp({
			commandName: 'astro preview',
			usage: '[...flags]',
			tables: {
				Flags: [
					['--port', `Specify which port to run on. Defaults to 4321.`],
					['--host', `Listen on all addresses, including LAN and public addresses.`],
					['--host <custom-address>', `Expose on a network IP address at <custom-address>`],
					['--open', 'Automatically open the app in the browser on server start'],
					['--help (-h)', 'See all available flags.'],
				],
			},
			description: `Starts a local server to serve your static dist/ directory. Check ${cyan(
				'https://docs.astro.build/en/reference/cli-reference/#astro-preview',
			)} for more information.`,
		});
		return;
	}

	const inlineConfig = flagsToAstroInlineConfig(flags);

	return await previewServer(inlineConfig);
}

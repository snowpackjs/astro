import { printHelp } from '../../core/messages.js';
import type { Flags } from '../flags.js';
import { openInBrowser } from './open.js';

interface DocsOptions {
	flags: Flags;
}

export async function docs({ flags }: DocsOptions) {
	if (flags.help || flags.h) {
		printHelp({
			commandName: 'astro docs',
			tables: {
				Flags: [['--help (-h)', 'See all available flags.']],
			},
			description: `Launches the Astro Docs website directly from the terminal.`,
		});
		return;
	}

	return await openInBrowser('https://docs.astro.build/');
}

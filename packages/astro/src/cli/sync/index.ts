import { printHelp } from '../../core/messages.js';
import _sync from '../../core/sync/index.js';
import { type Flags, flagsToAstroInlineConfig } from '../flags.js';

interface SyncOptions {
	flags: Flags;
}

export async function sync({ flags }: SyncOptions) {
	if (flags?.help || flags?.h) {
		printHelp({
			commandName: 'astro sync',
			usage: '[...flags]',
			tables: {
				Flags: [
					['--force', 'Clear the content layer cache, forcing a full rebuild.'],
					['--help (-h)', 'See all available flags.'],
				],
			},
			description: `Generates TypeScript types for all Astro modules.`,
		});
		return 0;
	}

	await _sync(flagsToAstroInlineConfig(flags), { telemetry: true });
}

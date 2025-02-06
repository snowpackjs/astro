import { printHelp } from '../messages.js';

export function help() {
	printHelp({
		commandName: '@astrojs/upgrade',
		usage: '[version] [...flags]',
		headline: 'Upgrade Astro dependencies.',
		tables: {
			Flags: [
				['--help (-h)', 'See all available flags.'],
				['--dry-run', 'Walk through steps without executing.'],
			],
		},
	});
}

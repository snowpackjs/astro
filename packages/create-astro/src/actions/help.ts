import { printHelp } from '../messages.js';

export function help() {
	printHelp({
		commandName: 'create-astro',
		usage: '[dir] [...flags]',
		headline: 'Scaffold Astro projects.',
		tables: {
			Flags: [
				['--help (-h)', 'See all available flags.'],
				['--template <name>', 'Specify your template.'],
				['--install / --no-install', 'Install dependencies (or not).'],
				['--add <integrations>', 'Add integrations.'],
				['--git / --no-git', 'Initialize git repo (or not).'],
				['--yes (-y)', 'Skip all prompts by accepting defaults.'],
				['--no (-n)', 'Skip all prompts by declining defaults.'],
				['--dry-run', 'Walk through steps without executing.'],
				['--skip-houston', 'Skip Houston animation.'],
				['--ref', 'Choose astro branch (default: latest).'],
				['--fancy', 'Enable full Unicode support for Windows.'],
			],
		},
	});
}

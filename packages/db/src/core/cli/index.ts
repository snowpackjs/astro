import type { AstroConfig } from 'astro';
import type { Arguments } from 'yargs-parser';
import { resolveDbConfig } from '../load-file.js';
import { printHelp } from './print-help.js';

export async function cli({
	flags,
	config: astroConfig,
}: {
	flags: Arguments;
	config: AstroConfig;
}) {
	const args = flags._ as string[];
	// Most commands are `astro db foo`, but for now login/logout
	// are also handled by this package, so first check if this is a db command.
	const command = args[2] === 'db' ? args[3] : args[2];
	const { dbConfig } = await resolveDbConfig(astroConfig);

	switch (command) {
		case 'shell': {
			const { cmd } = await import('./commands/shell/index.js');
			return await cmd({ astroConfig, dbConfig, flags });
		}
		case 'gen': {
			console.log('"astro db gen" is no longer needed! Visit the docs for more information.');
			return;
		}
		case 'sync': {
			console.log('"astro db sync" is no longer needed! Visit the docs for more information.');
			return;
		}
		case 'push': {
			const { cmd } = await import('./commands/push/index.js');
			return await cmd({ astroConfig, dbConfig, flags });
		}
		case 'verify': {
			const { cmd } = await import('./commands/verify/index.js');
			return await cmd({ astroConfig, dbConfig, flags });
		}
		case 'execute': {
			const { cmd } = await import('./commands/execute/index.js');
			return await cmd({ astroConfig, dbConfig, flags });
		}
		case 'login': {
			const { cmd } = await import('./commands/login/index.js');
			return await cmd({ astroConfig, dbConfig, flags });
		}
		case 'logout': {
			const { cmd } = await import('./commands/logout/index.js');
			return await cmd();
		}
		case 'link': {
			const { cmd } = await import('./commands/link/index.js');
			return await cmd();
		}
		default: {
			if (command != null) {
				console.error(`Unknown command: ${command}`);
			}
			printHelp({
				commandName: 'astro db',
				usage: '[command] [...flags]',
				headline: ' ',
				tables: {
					Commands: [
						['push', 'Push table schema updates to Astro Studio.'],
						['verify', 'Test schema updates /w Astro Studio (good for CI).'],
						[
							'astro db execute <file-path>',
							'Execute a ts/js file using astro:db. Use --remote to connect to Studio.',
						],
						[
							'astro db shell --query <sql-string>',
							'Execute a SQL string. Use --remote to connect to Studio.',
						],
					],
				},
			});
			return;
		}
	}
}

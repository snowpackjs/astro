import os from 'node:os';
import { type Task, prompt } from '@astrojs/cli-kit';
import { random } from '@astrojs/cli-kit/utils';
import arg from 'arg';

import getSeasonalData from '../data/seasonal.js';
import { getName, getVersion } from '../messages.js';

export interface Context {
	help: boolean;
	prompt: typeof prompt;
	cwd: string;
	packageManager: string;
	username: Promise<string>;
	version: Promise<string>;
	skipHouston: boolean;
	fancy?: boolean;
	add?: string[];
	dryRun?: boolean;
	yes?: boolean;
	projectName?: string;
	template?: string;
	ref: string;
	install?: boolean;
	git?: boolean;
	typescript?: string;
	stdin?: typeof process.stdin;
	stdout?: typeof process.stdout;
	exit(code: number): never;
	welcome?: string;
	hat?: string;
	tie?: string;
	tasks: Task[];
}

export async function getContext(argv: string[]): Promise<Context> {
	const flags = arg(
		{
			'--template': String,
			'--ref': String,
			'--yes': Boolean,
			'--no': Boolean,
			'--install': Boolean,
			'--no-install': Boolean,
			'--git': Boolean,
			'--no-git': Boolean,
			'--skip-houston': Boolean,
			'--dry-run': Boolean,
			'--help': Boolean,
			'--fancy': Boolean,
			'--add': [String],

			'-y': '--yes',
			'-n': '--no',
			'-h': '--help',
		},
		{ argv, permissive: true },
	);

	const packageManager = detectPackageManager() ?? 'npm';
	let cwd = flags['_'][0];
	let {
		'--help': help = false,
		'--template': template,
		'--no': no,
		'--yes': yes,
		'--install': install,
		'--no-install': noInstall,
		'--git': git,
		'--no-git': noGit,
		'--fancy': fancy,
		'--skip-houston': skipHouston,
		'--dry-run': dryRun,
		'--ref': ref,
		'--add': add,
	} = flags;
	let projectName = cwd;

	if (no) {
		yes = false;
		if (install == undefined) install = false;
		if (git == undefined) git = false;
	}

	skipHouston =
		((os.platform() === 'win32' && !fancy) || skipHouston) ??
		[yes, no, install, git].some((v) => v !== undefined);

	const { messages, hats, ties } = getSeasonalData({ fancy });

	const context: Context = {
		help,
		prompt,
		packageManager,
		username: getName(),
		version: getVersion(packageManager, 'astro', process.env.ASTRO_VERSION),
		skipHouston,
		fancy,
		add,
		dryRun,
		projectName,
		template,
		ref: ref ?? 'latest',
		welcome: random(messages),
		hat: hats ? random(hats) : undefined,
		tie: ties ? random(ties) : undefined,
		yes,
		install: install ?? (noInstall ? false : undefined),
		git: git ?? (noGit ? false : undefined),
		cwd,
		exit(code) {
			process.exit(code);
		},
		tasks: [],
	};
	return context;
}

function detectPackageManager() {
	if (!process.env.npm_config_user_agent) return;
	const specifier = process.env.npm_config_user_agent.split(' ')[0];
	const name = specifier.substring(0, specifier.lastIndexOf('/'));
	return name === 'npminstall' ? 'cnpm' : name;
}

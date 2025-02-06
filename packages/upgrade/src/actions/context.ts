import { pathToFileURL } from 'node:url';
import { prompt } from '@astrojs/cli-kit';
import arg from 'arg';
import detectPackageManager from 'preferred-pm';

export interface Context {
	help: boolean;
	prompt: typeof prompt;
	version: string;
	dryRun?: boolean;
	cwd: URL;
	stdin?: typeof process.stdin;
	stdout?: typeof process.stdout;
	packageManager: string;
	packages: PackageInfo[];
	exit(code: number): never;
}

export interface PackageInfo {
	name: string;
	currentVersion: string;
	targetVersion: string;
	tag?: string;
	isDevDependency?: boolean;
	isMajor?: boolean;
	changelogURL?: string;
	changelogTitle?: string;
}

export async function getContext(argv: string[]): Promise<Context> {
	const flags = arg(
		{
			'--dry-run': Boolean,
			'--help': Boolean,

			'-h': '--help',
		},
		{ argv, permissive: true },
	);

	const packageManager = (await detectPackageManager(process.cwd()))?.name ?? 'npm';
	const {
		_: [version = 'latest'] = [],
		'--help': help = false,
		'--dry-run': dryRun,
	} = flags;

	return {
		help,
		prompt,
		packageManager,
		packages: [],
		cwd: new URL(pathToFileURL(process.cwd()) + '/'),
		dryRun,
		version,
		exit(code) {
			process.exit(code);
		},
	} satisfies Context;
}

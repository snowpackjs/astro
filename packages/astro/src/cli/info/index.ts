import { spawnSync } from 'node:child_process';
import { arch, platform } from 'node:os';
import * as colors from 'kleur/colors';
import prompts from 'prompts';
import { resolveConfig } from '../../core/config/index.js';
import { ASTRO_VERSION } from '../../core/constants.js';
import { apply as applyPolyfill } from '../../core/polyfill.js';
import type { AstroConfig, AstroUserConfig } from '../../types/public/config.js';
import { type Flags, flagsToAstroInlineConfig } from '../flags.js';

interface InfoOptions {
	flags: Flags;
}

export async function getInfoOutput({
	userConfig,
	print,
}: {
	userConfig: AstroUserConfig | AstroConfig;
	print: boolean;
}): Promise<string> {
	const rows: Array<[string, string | string[]]> = [
		['Astro', `v${ASTRO_VERSION}`],
		['Node', process.version],
		['System', getSystem()],
		['Package Manager', getPackageManager()],
	];

	try {
		rows.push(['Output', userConfig.output ?? 'static']);
		rows.push(['Adapter', userConfig.adapter?.name ?? 'none']);
		const integrations = (userConfig?.integrations ?? [])
			.filter(Boolean)
			.flat()
			.map((i: any) => i?.name)
			.filter(Boolean);
		rows.push(['Integrations', integrations.length > 0 ? integrations : 'none']);
	} catch {}

	let output = '';
	for (const [label, value] of rows) {
		output += printRow(label, value, print);
	}

	return output.trim();
}

export async function printInfo({ flags }: InfoOptions) {
	applyPolyfill();
	const { userConfig } = await resolveConfig(flagsToAstroInlineConfig(flags), 'info');
	const output = await getInfoOutput({ userConfig, print: true });
	await copyToClipboard(output, flags.copy);
}

export async function copyToClipboard(text: string, force?: boolean) {
	text = text.trim();
	const system = platform();
	let command = '';
	let args: Array<string> = [];

	if (system === 'darwin') {
		command = 'pbcopy';
	} else if (system === 'win32') {
		command = 'clip';
	} else {
		// Unix: check if a supported command is installed

		const unixCommands: Array<[string, Array<string>]> = [
			['xclip', ['-selection', 'clipboard', '-l', '1']],
			['wl-copy', []],
		];
		for (const [unixCommand, unixArgs] of unixCommands) {
			try {
				const output = spawnSync('which', [unixCommand], { encoding: 'utf8' });
				if (output.stdout.trim()) {
					command = unixCommand;
					args = unixArgs;
					break;
				}
			} catch {
				continue;
			}
		}
	}

	if (!command) {
		console.error(colors.red('\nClipboard command not found!'));
		console.info('Please manually copy the text above.');
		return;
	}

	if (!force) {
		const { shouldCopy } = await prompts({
			type: 'confirm',
			name: 'shouldCopy',
			message: 'Copy to clipboard?',
			initial: true,
		});

		if (!shouldCopy) return;
	}

	try {
		const result = spawnSync(command, args, { input: text, stdio: ['pipe', 'ignore', 'ignore'] });
		if (result.error) {
			throw result.error;
		}
		console.info(colors.green('Copied to clipboard!'));
	} catch {
		console.error(
			colors.red(`\nSorry, something went wrong!`) + ` Please copy the text above manually.`,
		);
	}
}

export function readFromClipboard() {
	const system = platform();
	let command = '';
	let args: Array<string> = [];

	if (system === 'darwin') {
		command = 'pbpaste';
	} else if (system === 'win32') {
		command = 'powershell';
		args = ['-command', 'Get-Clipboard'];
	} else {
		const unixCommands: Array<[string, Array<string>]> = [
			['xclip', ['-sel', 'clipboard', '-o']],
			['wl-paste', []],
		];
		for (const [unixCommand, unixArgs] of unixCommands) {
			try {
				const output = spawnSync('which', [unixCommand], { encoding: 'utf8' });
				if (output.stdout.trim()) {
					command = unixCommand;
					args = unixArgs;
					break;
				}
			} catch {
				continue;
			}
		}
	}

	if (!command) {
		throw new Error('Clipboard read command not found!');
	}

	const result = spawnSync(command, args, { encoding: 'utf8' });
	if (result.error) {
		throw result.error;
	}
	return result.stdout.trim();
}

const PLATFORM_TO_OS: Partial<Record<ReturnType<typeof platform>, string>> = {
	darwin: 'macOS',
	win32: 'Windows',
	linux: 'Linux',
};

function getSystem() {
	const system = PLATFORM_TO_OS[platform()] ?? platform();
	return `${system} (${arch()})`;
}

function getPackageManager() {
	if (!process.env.npm_config_user_agent) {
		return 'unknown';
	}
	const specifier = process.env.npm_config_user_agent.split(' ')[0];
	const name = specifier.substring(0, specifier.lastIndexOf('/'));
	return name === 'npminstall' ? 'cnpm' : name;
}

const MAX_PADDING = 25;
function printRow(label: string, value: string | string[], print: boolean) {
	const padding = MAX_PADDING - label.length;
	const [first, ...rest] = Array.isArray(value) ? value : [value];
	let plaintext = `${label}${' '.repeat(padding)}${first}`;
	let richtext = `${colors.bold(label)}${' '.repeat(padding)}${colors.green(first)}`;
	if (rest.length > 0) {
		for (const entry of rest) {
			plaintext += `\n${' '.repeat(MAX_PADDING)}${entry}`;
			richtext += `\n${' '.repeat(MAX_PADDING)}${colors.green(entry)}`;
		}
	}
	plaintext += '\n';
	if (print) {
		console.info(richtext);
	}
	return plaintext;
}

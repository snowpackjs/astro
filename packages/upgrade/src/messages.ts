/* eslint no-console: 'off' */
import { color, label, spinner as load } from '@astrojs/cli-kit';
import { align } from '@astrojs/cli-kit/utils';
import detectPackageManager from 'preferred-pm';
import terminalLink from 'terminal-link';
import type { PackageInfo } from './actions/context.js';
import { shell } from './shell.js';

// Users might lack access to the global npm registry, this function
// checks the user's project type and will return the proper npm registry
//
// A copy of this function also exists in the astro package
let _registry: string;
export async function getRegistry(): Promise<string> {
	if (_registry) return _registry;
	const fallback = 'https://registry.npmjs.org';
	const packageManager = (await detectPackageManager(process.cwd()))?.name || 'npm';
	try {
		const { stdout } = await shell(packageManager, ['config', 'get', 'registry']);
		_registry = stdout?.trim()?.replace(/\/$/, '') || fallback;
		// Detect cases where the shell command returned a non-URL (e.g. a warning)
		if (!new URL(_registry).host) _registry = fallback;
	} catch {
		_registry = fallback;
	}
	return _registry;
}

let stdout = process.stdout;
/** @internal Used to mock `process.stdout.write` for testing purposes */
export function setStdout(writable: typeof process.stdout) {
	stdout = writable;
}

export async function spinner(args: {
	start: string;
	end: string;
	while: (...args: any) => Promise<any>;
}) {
	await load(args, { stdout });
}

export function pluralize(word: string | [string, string], n: number) {
	const [singular, plural] = Array.isArray(word) ? word : [word, word + 's'];
	if (n === 1) return singular;
	return plural;
}

export const celebrations = [
	'Beautiful.',
	'Excellent!',
	'Sweet!',
	'Nice!',
	'Huzzah!',
	'Success.',
	'Nice.',
	'Wonderful.',
	'Lovely!',
	"Lookin' good.",
	'Awesome.',
];

export const done = [
	"You're on the latest and greatest.",
	'Your integrations are up-to-date.',
	'Everything is current.',
	'Everything is up to date.',
	'Integrations are all up to date.',
	'Everything is on the latest and greatest.',
	'Integrations are up to date.',
];

export const bye = [
	'Thanks for using Astro!',
	'Have fun building!',
	'Take it easy, astronaut!',
	"Can't wait to see what you build.",
	'Good luck out there.',
	'See you around, astronaut.',
];

export const log = (message: string) => stdout.write(message + '\n');

export const newline = () => stdout.write('\n');

export const banner = async () =>
	log(
		`\n${label('astro', color.bgGreen, color.black)}  ${color.bold(
			'Integration upgrade in progress.',
		)}`,
	);

export const bannerAbort = () =>
	log(`\n${label('astro', color.bgRed)} ${color.bold('Integration upgrade aborted.')}`);

export const warn = async (prefix: string, text: string) => {
	log(`${label(prefix, color.bgCyan, color.black)}  ${text}`);
};

export const info = async (prefix: string, text: string, version = '') => {
	const length = 11 + prefix.length + text.length + version?.length;
	const symbol = '◼';
	if (length > stdout.columns) {
		log(`${' '.repeat(5)} ${color.cyan(symbol)}  ${prefix}`);
		log(`${' '.repeat(9)}${color.dim(text)} ${color.reset(version)}`);
	} else {
		log(
			`${' '.repeat(5)} ${color.cyan(symbol)}  ${prefix} ${color.dim(text)} ${color.reset(version)}`,
		);
	}
};

export const upgrade = async (packageInfo: PackageInfo, text: string) => {
	const { name, isMajor = false, targetVersion, currentVersion } = packageInfo;

	const bg = isMajor ? (v: string) => color.bgYellow(color.black(` ${v} `)) : color.green;
	const style = isMajor ? color.yellow : color.green;
	const symbol = isMajor ? '▲' : '●';

	const fromVersion = currentVersion.replace(/^\D+/, '');
	const toVersion = targetVersion.replace(/^\D+/, '');
	const version = `from v${fromVersion} to v${toVersion}`;

	const length = 12 + name.length + text.length + version.length;
	if (length > stdout.columns) {
		log(`${' '.repeat(5)} ${style(symbol)}  ${name}`);
		log(`${' '.repeat(9)}${color.dim(text)} ${bg(version)}`);
	} else {
		log(`${' '.repeat(5)} ${style(symbol)}  ${name} ${color.dim(text)} ${bg(version)}`);
	}
};

export const title = (text: string) =>
	align(label(text, color.bgYellow, color.black), 'end', 7) + ' ';

export const success = async (prefix: string, text: string) => {
	const length = 10 + prefix.length + text.length;
	if (length > stdout.columns) {
		log(`${' '.repeat(5)} ${color.green('✔')}  ${prefix}`);
		log(`${' '.repeat(9)}${color.dim(text)}`);
	} else {
		log(`${' '.repeat(5)} ${color.green('✔')}  ${prefix} ${color.dim(text)}`);
	}
};

export const error = async (prefix: string, text: string) => {
	if (stdout.columns < 80) {
		log(`${' '.repeat(5)} ${color.red('▲')}  ${color.red(prefix)}`);
		log(`${' '.repeat(9)}${color.dim(text)}`);
	} else {
		log(`${' '.repeat(5)} ${color.red('▲')}  ${color.red(prefix)} ${color.dim(text)}`);
	}
};

export const changelog = async (name: string, text: string, url: string) => {
	const link = terminalLink(text, url, { fallback: () => url });
	const linkLength = terminalLink.isSupported ? text.length : url.length;
	const symbol = ' ';

	const length = 12 + name.length + linkLength;
	if (length > stdout.columns) {
		log(`${' '.repeat(5)} ${symbol}  ${name}`);
		log(`${' '.repeat(9)}${color.cyan(color.underline(link))}`);
	} else {
		log(`${' '.repeat(5)} ${symbol}  ${name} ${color.cyan(color.underline(link))}`);
	}
};

export function printHelp({
	commandName,
	usage,
	tables,
	description,
}: {
	commandName: string;
	headline?: string;
	usage?: string;
	tables?: Record<string, [command: string, help: string][]>;
	description?: string;
}) {
	const linebreak = () => '';
	const table = (rows: [string, string][], { padding }: { padding: number }) => {
		const split = stdout.columns < 60;
		let raw = '';

		for (const row of rows) {
			if (split) {
				raw += `    ${row[0]}\n    `;
			} else {
				raw += `${`${row[0]}`.padStart(padding)}`;
			}
			raw += '  ' + color.dim(row[1]) + '\n';
		}

		return raw.slice(0, -1); // remove latest \n
	};

	let message = [];

	if (usage) {
		message.push(linebreak(), `${color.green(commandName)} ${color.bold(usage)}`);
	}

	if (tables) {
		function calculateTablePadding(rows: [string, string][]) {
			return rows.reduce((val, [first]) => Math.max(val, first.length), 0);
		}
		const tableEntries = Object.entries(tables);
		const padding = Math.max(...tableEntries.map(([, rows]) => calculateTablePadding(rows)));
		for (const [, tableRows] of tableEntries) {
			message.push(linebreak(), table(tableRows, { padding }));
		}
	}

	if (description) {
		message.push(linebreak(), `${description}`);
	}

	log(message.join('\n') + '\n');
}

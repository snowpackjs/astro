import { exec } from 'node:child_process';
import { stripVTControlCharacters } from 'node:util';
/* eslint no-console: 'off' */
import { color, say as houston, label, spinner as load } from '@astrojs/cli-kit';
import { align, sleep } from '@astrojs/cli-kit/utils';
import { shell } from './shell.js';

// Users might lack access to the global npm registry, this function
// checks the user's project type and will return the proper npm registry
//
// A copy of this function also exists in the astro package
let _registry: string;
async function getRegistry(packageManager: string): Promise<string> {
	if (_registry) return _registry;
	const fallback = 'https://registry.npmjs.org';
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

export async function say(messages: string | string[], { clear = false, hat = '', tie = '' } = {}) {
	return houston(messages, { clear, hat, tie, stdout });
}

export async function spinner(args: {
	start: string;
	end: string;
	onError?: (error: any) => void;
	while: (...args: any) => Promise<any>;
}) {
	await load(args, { stdout });
}

export const title = (text: string) => align(label(text), 'end', 7) + ' ';

export const getName = () =>
	new Promise<string>((resolve) => {
		exec('git config user.name', { encoding: 'utf-8' }, (_1, gitName) => {
			if (gitName.trim()) {
				return resolve(gitName.split(' ')[0].trim());
			}
			exec('whoami', { encoding: 'utf-8' }, (_3, whoami) => {
				if (whoami.trim()) {
					return resolve(whoami.split(' ')[0].trim());
				}
				return resolve('astronaut');
			});
		});
	});

export const getVersion = (packageManager: string, packageName: string, fallback = '') =>
	new Promise<string>(async (resolve) => {
		let registry = await getRegistry(packageManager);
		const { version } = await fetch(`${registry}/${packageName}/latest`, {
			redirect: 'follow',
		})
			.then((res) => res.json())
			.catch(() => ({ version: fallback }));
		return resolve(version);
	});

export const log = (message: string) => stdout.write(message + '\n');
export const banner = () => {
	const prefix = `astro`;
	const suffix = `Launch sequence initiated.`;
	log(`${label(prefix, color.bgGreen, color.black)}  ${suffix}`);
};

export const bannerAbort = () =>
	log(`\n${label('astro', color.bgRed)} ${color.bold('Launch sequence aborted.')}`);

export const info = async (prefix: string, text: string) => {
	await sleep(100);
	if (stdout.columns < 80) {
		log(`${' '.repeat(5)} ${color.cyan('◼')}  ${color.cyan(prefix)}`);
		log(`${' '.repeat(9)}${color.dim(text)}`);
	} else {
		log(`${' '.repeat(5)} ${color.cyan('◼')}  ${color.cyan(prefix)} ${color.dim(text)}`);
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

export const typescriptByDefault = async () => {
	await info(`No worries!`, 'TypeScript is supported in Astro by default,');
	log(`${' '.repeat(9)}${color.dim('but you are free to continue writing JavaScript instead.')}`);
	await sleep(1000);
};

export const nextSteps = async ({ projectDir, devCmd }: { projectDir: string; devCmd: string }) => {
	const max = stdout.columns;
	const prefix = max < 80 ? ' ' : ' '.repeat(9);
	await sleep(200);
	log(
		`\n ${color.bgCyan(` ${color.black('next')} `)}  ${color.bold(
			'Liftoff confirmed. Explore your project!',
		)}`,
	);

	await sleep(100);
	if (projectDir !== '') {
		projectDir = projectDir.includes(' ') ? `"./${projectDir}"` : `./${projectDir}`;
		const enter = [
			`\n${prefix}Enter your project directory using`,
			color.cyan(`cd ${projectDir}`, ''),
		];
		const len = enter[0].length + stripVTControlCharacters(enter[1]).length;
		log(enter.join(len > max ? '\n' + prefix : ' '));
	}
	log(
		`${prefix}Run ${color.cyan(devCmd)} to start the dev server. ${color.cyan('CTRL+C')} to stop.`,
	);
	await sleep(100);
	log(
		`${prefix}Add frameworks like ${color.cyan(`react`)} or ${color.cyan(
			'tailwind',
		)} using ${color.cyan('astro add')}.`,
	);
	await sleep(100);
	log(`\n${prefix}Stuck? Join us at ${color.cyan(`https://astro.build/chat`)}`);
	await sleep(200);
};

export function printHelp({
	commandName,
	headline,
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

	if (headline) {
		message.push(
			linebreak(),
			`${title(commandName)} ${color.green(`v${process.env.PACKAGE_VERSION ?? ''}`)} ${headline}`,
		);
	}

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

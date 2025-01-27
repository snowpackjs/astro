import {
	bgCyan,
	bgGreen,
	bgRed,
	bgWhite,
	bgYellow,
	black,
	blue,
	bold,
	cyan,
	dim,
	green,
	red,
	underline,
	yellow,
} from 'kleur/colors';
import type { ResolvedServerUrls } from 'vite';
import type { ZodError } from 'zod';
import { getExecCommand } from '../cli/install-package.js';
import { getDocsForError, renderErrorMarkdown } from './errors/dev/utils.js';
import {
	AstroError,
	AstroUserError,
	CompilerError,
	type ErrorWithMetadata,
} from './errors/index.js';
import { padMultilineString } from './util.js';

/**
 * Prestyled messages for the CLI. Used by astro CLI commands.
 */

/** Display each request being served with the path and the status code.  */
export function req({
	url,
	method,
	statusCode,
	reqTime,
	isRewrite,
}: {
	url: string;
	statusCode: number;
	method?: string;
	reqTime?: number;
	isRewrite?: boolean;
}): string {
	const color = statusCode >= 500 ? red : statusCode >= 300 ? yellow : blue;
	return (
		color(`[${statusCode}]`) +
		` ` +
		`${isRewrite ? color('(rewrite) ') : ''}` +
		(method && method !== 'GET' ? color(method) + ' ' : '') +
		url +
		` ` +
		(reqTime ? dim(Math.round(reqTime) + 'ms') : '')
	);
}

/** Display server host and startup time */
export function serverStart({
	startupTime,
	resolvedUrls,
	host,
	base,
}: {
	startupTime: number;
	resolvedUrls: ResolvedServerUrls;
	host: string | boolean;
	base: string;
}): string {
	// PACKAGE_VERSION is injected at build-time
	const version = process.env.PACKAGE_VERSION ?? '0.0.0';
	const localPrefix = `${dim('┃')} Local    `;
	const networkPrefix = `${dim('┃')} Network  `;
	const emptyPrefix = ' '.repeat(11);

	const localUrlMessages = resolvedUrls.local.map((url, i) => {
		return `${i === 0 ? localPrefix : emptyPrefix}${cyan(new URL(url).origin + base)}`;
	});
	const networkUrlMessages = resolvedUrls.network.map((url, i) => {
		return `${i === 0 ? networkPrefix : emptyPrefix}${cyan(new URL(url).origin + base)}`;
	});

	if (networkUrlMessages.length === 0) {
		const networkLogging = getNetworkLogging(host);
		if (networkLogging === 'host-to-expose') {
			networkUrlMessages.push(`${networkPrefix}${dim('use --host to expose')}`);
		} else if (networkLogging === 'visible') {
			networkUrlMessages.push(`${networkPrefix}${dim('unable to find network to expose')}`);
		}
	}

	const messages = [
		'',
		`${bgGreen(bold(` astro `))} ${green(`v${version}`)} ${dim(`ready in`)} ${Math.round(
			startupTime,
		)} ${dim('ms')}`,
		'',
		...localUrlMessages,
		...networkUrlMessages,
		'',
	];
	return messages.filter((msg) => typeof msg === 'string').join('\n');
}

/** Display custom dev server shortcuts */
export function serverShortcuts({ key, label }: { key: string; label: string }): string {
	return [dim('  Press'), key, dim('to'), label].join(' ');
}

export async function newVersionAvailable({ latestVersion }: { latestVersion: string }) {
	const badge = bgYellow(black(` update `));
	const headline = yellow(`▶ New version of Astro available: ${latestVersion}`);
	const execCommand = await getExecCommand();

	const details = `  Run ${cyan(`${execCommand} @astrojs/upgrade`)} to update`;
	return ['', `${badge} ${headline}`, details, ''].join('\n');
}

export function telemetryNotice() {
	const headline = blue(`▶ Astro collects anonymous usage data.`);
	const why = '  This information helps us improve Astro.';
	const disable = `  Run "astro telemetry disable" to opt-out.`;
	const details = `  ${cyan(underline('https://astro.build/telemetry'))}`;
	return [headline, why, disable, details].join('\n');
}

export function telemetryEnabled() {
	return [
		green('▶ Anonymous telemetry ') + bgGreen(' enabled '),
		`  Thank you for helping us improve Astro!`,
		``,
	].join('\n');
}

export function preferenceEnabled(name: string) {
	return `${green('◉')} ${name} is now ${bgGreen(black(' enabled '))}\n`;
}

export function preferenceSet(name: string, value: any) {
	return `${green('◉')} ${name} has been set to ${bgGreen(black(` ${JSON.stringify(value)} `))}\n`;
}

export function preferenceGet(name: string, value: any) {
	return `${green('◉')} ${name} is set to ${bgGreen(black(` ${JSON.stringify(value)} `))}\n`;
}

export function preferenceDefaultIntro(name: string) {
	return `${yellow('◯')} ${name} has not been set. It defaults to\n`;
}

export function preferenceDefault(name: string, value: any) {
	return `${yellow('◯')} ${name} has not been set. It defaults to ${bgYellow(
		black(` ${JSON.stringify(value)} `),
	)}\n`;
}

export function preferenceDisabled(name: string) {
	return `${yellow('◯')} ${name} is now ${bgYellow(black(' disabled '))}\n`;
}

export function preferenceReset(name: string) {
	return `${cyan('◆')} ${name} has been ${bgCyan(black(' reset '))}\n`;
}

export function telemetryDisabled() {
	return [
		green('▶ Anonymous telemetry ') + bgGreen(' disabled '),
		`  Astro is no longer collecting anonymous usage data.`,
		``,
	].join('\n');
}

export function telemetryReset() {
	return [green('▶ Anonymous telemetry preferences reset.'), ``].join('\n');
}

export function fsStrictWarning() {
	const title = yellow('▶ ' + `${bold('vite.server.fs.strict')} has been disabled!`);
	const subtitle = `  Files on your machine are likely accessible on your network.`;
	return `${title}\n${subtitle}\n`;
}

export function prerelease({ currentVersion }: { currentVersion: string }) {
	const tag = currentVersion.split('-').slice(1).join('-').replace(/\..*$/, '') || 'unknown';
	const badge = bgYellow(black(` ${tag} `));
	const title = yellow('▶ ' + `This is a ${badge} prerelease build!`);
	const subtitle = `  Report issues here: ${cyan(underline('https://astro.build/issues'))}`;
	return `${title}\n${subtitle}\n`;
}

export function success(message: string, tip?: string) {
	const badge = bgGreen(black(` success `));
	const headline = green(message);
	const footer = tip ? `\n  ▶ ${tip}` : undefined;
	return ['', `${badge} ${headline}`, footer]
		.filter((v) => v !== undefined)
		.map((msg) => `  ${msg}`)
		.join('\n');
}

export function failure(message: string, tip?: string) {
	const badge = bgRed(black(` error `));
	const headline = red(message);
	const footer = tip ? `\n  ▶ ${tip}` : undefined;
	return ['', `${badge} ${headline}`, footer]
		.filter((v) => v !== undefined)
		.map((msg) => `  ${msg}`)
		.join('\n');
}

export function cancelled(message: string, tip?: string) {
	const badge = bgYellow(black(` cancelled `));
	const headline = yellow(message);
	const footer = tip ? `\n  ▶ ${tip}` : undefined;
	return ['', `${badge} ${headline}`, footer]
		.filter((v) => v !== undefined)
		.map((msg) => `  ${msg}`)
		.join('\n');
}

const LOCAL_IP_HOSTS = new Set(['localhost', '127.0.0.1']);

function getNetworkLogging(host: string | boolean): 'none' | 'host-to-expose' | 'visible' {
	if (host === false) {
		return 'host-to-expose';
	} else if (typeof host === 'string' && LOCAL_IP_HOSTS.has(host)) {
		return 'none';
	} else {
		return 'visible';
	}
}

const codeRegex = /`([^`]+)`/g;

export function formatConfigErrorMessage(err: ZodError) {
	const errorList = err.issues.map((issue) =>
		`! ${renderErrorMarkdown(issue.message, 'cli')}`
			// Make text wrapped in backticks blue.
			.replaceAll(codeRegex, blue('$1'))
			// Make the first line red and indent the rest.
			.split('\n')
			.map((line, index) => (index === 0 ? red(line) : '  ' + line))
			.join('\n'),
	);
	return `${red('[config]')} Astro found issue(s) with your configuration:\n\n${errorList.join(
		'\n\n',
	)}`;
}

// a regex to match the first line of a stack trace
const STACK_LINE_REGEXP = /^\s+at /g;
const IRRELEVANT_STACK_REGEXP = /node_modules|astro[/\\]dist/g;

function formatErrorStackTrace(
	err: Error | ErrorWithMetadata,
	showFullStacktrace: boolean,
): string {
	const stackLines = (err.stack || '').split('\n').filter((line) => STACK_LINE_REGEXP.test(line));
	// If full details are required, just return the entire stack trace.
	if (showFullStacktrace) {
		return stackLines.join('\n');
	}
	// Grab every string from the user's codebase, exit when you hit node_modules or astro/dist
	const irrelevantStackIndex = stackLines.findIndex((line) => IRRELEVANT_STACK_REGEXP.test(line));
	if (irrelevantStackIndex <= 0) {
		const errorId = (err as ErrorWithMetadata).id;
		const errorLoc = (err as ErrorWithMetadata).loc;
		if (errorId || errorLoc?.file) {
			const prettyLocation = `    at ${errorId ?? errorLoc?.file}${
				errorLoc?.line && errorLoc.column ? `:${errorLoc.line}:${errorLoc.column}` : ''
			}`;
			return (
				prettyLocation + '\n    [...] See full stack trace in the browser, or rerun with --verbose.'
			);
		} else {
			return stackLines.join('\n');
		}
	}
	// If the error occurred inside of a dependency, grab the entire stack.
	// Otherwise, only grab the part of the stack that is relevant to the user's codebase.
	return (
		stackLines.splice(0, irrelevantStackIndex).join('\n') +
		'\n    [...] See full stack trace in the browser, or rerun with --verbose.'
	);
}

export function formatErrorMessage(err: ErrorWithMetadata, showFullStacktrace: boolean): string {
	const isOurError = AstroError.is(err) || CompilerError.is(err) || AstroUserError.is(err);
	let message = '';
	if (isOurError) {
		message += red(`[${err.name}]`) + ' ' + renderErrorMarkdown(err.message, 'cli');
	} else {
		message += err.message;
	}
	const output = [message];

	if (err.hint) {
		output.push(`  ${bold('Hint:')}`);
		output.push(yellow(padMultilineString(renderErrorMarkdown(err.hint, 'cli'), 4)));
	}

	const docsLink = getDocsForError(err);
	if (docsLink) {
		output.push(`  ${bold('Error reference:')}`);
		output.push(`    ${cyan(underline(docsLink))}`);
	}

	if (showFullStacktrace && err.loc) {
		output.push(`  ${bold('Location:')}`);
		output.push(`    ${underline(`${err.loc.file}:${err.loc.line ?? 0}:${err.loc.column ?? 0}`)}`);
	}

	if (err.stack) {
		output.push(`  ${bold('Stack trace:')}`);
		output.push(dim(formatErrorStackTrace(err, showFullStacktrace)));
	}

	if (err.cause) {
		output.push(`  ${bold('Caused by:')}`);
		let causeMessage = '  ';
		if (err.cause instanceof Error) {
			causeMessage +=
				err.cause.message + '\n' + formatErrorStackTrace(err.cause, showFullStacktrace);
		} else {
			causeMessage += JSON.stringify(err.cause);
		}
		output.push(dim(causeMessage));
	}

	return output.join('\n');
}

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
	const title = (label: string) => `  ${bgWhite(black(` ${label} `))}`;
	const table = (rows: [string, string][], { padding }: { padding: number }) => {
		const split = process.stdout.columns < 60;
		let raw = '';

		for (const row of rows) {
			if (split) {
				raw += `    ${row[0]}\n    `;
			} else {
				raw += `${`${row[0]}`.padStart(padding)}`;
			}
			raw += '  ' + dim(row[1]) + '\n';
		}

		return raw.slice(0, -1); // remove latest \n
	};

	let message = [];

	if (headline) {
		message.push(
			linebreak(),
			`  ${bgGreen(black(` ${commandName} `))} ${green(
				`v${process.env.PACKAGE_VERSION ?? ''}`,
			)} ${headline}`,
		);
	}

	if (usage) {
		message.push(linebreak(), `  ${green(commandName)} ${bold(usage)}`);
	}

	if (tables) {
		function calculateTablePadding(rows: [string, string][]) {
			return rows.reduce((val, [first]) => Math.max(val, first.length), 0) + 2;
		}

		const tableEntries = Object.entries(tables);
		const padding = Math.max(...tableEntries.map(([, rows]) => calculateTablePadding(rows)));
		for (const [tableTitle, tableRows] of tableEntries) {
			message.push(linebreak(), title(tableTitle), table(tableRows, { padding }));
		}
	}

	if (description) {
		message.push(linebreak(), `${description}`);
	}

	// biome-ignore lint/suspicious/noConsoleLog: allowed
	console.log(message.join('\n') + '\n');
}

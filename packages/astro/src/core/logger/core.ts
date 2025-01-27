import { blue, bold, dim, red, yellow } from 'kleur/colors';

export interface LogWritable<T> {
	write: (chunk: T) => boolean;
}

export type LoggerLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'; // same as Pino

/**
 * Defined logger labels. Add more as needed, but keep them high-level & reusable,
 * rather than specific to a single command, function, use, etc. The label will be
 * shown in the log message to the user, so it should be relevant.
 */
export type LoggerLabel =
	| 'add'
	| 'build'
	| 'check'
	| 'config'
	| 'content'
	| 'crypto'
	| 'deprecated'
	| 'markdown'
	| 'router'
	| 'types'
	| 'vite'
	| 'watch'
	| 'middleware'
	| 'preferences'
	| 'redirects'
	| 'sync'
	| 'toolbar'
	| 'assets'
	| 'env'
	| 'update'
	| 'adapter'
	| 'islands'
	// SKIP_FORMAT: A special label that tells the logger not to apply any formatting.
	// Useful for messages that are already formatted, like the server start message.
	| 'SKIP_FORMAT';

export interface LogOptions {
	dest: LogWritable<LogMessage>;
	level: LoggerLevel;
}

// Hey, locales are pretty complicated! Be careful modifying this logic...
// If we throw at the top-level, international users can't use Astro.
//
// Using `[]` sets the default locale properly from the system!
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters
//
// Here be the dragons we've slain:
// https://github.com/withastro/astro/issues/2625
// https://github.com/withastro/astro/issues/3309
export const dateTimeFormat = new Intl.DateTimeFormat([], {
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hour12: false,
});

export interface LogMessage {
	label: string | null;
	level: LoggerLevel;
	message: string;
	newLine: boolean;
}

export const levels: Record<LoggerLevel, number> = {
	debug: 20,
	info: 30,
	warn: 40,
	error: 50,
	silent: 90,
};

/** Full logging API */
export function log(
	opts: LogOptions,
	level: LoggerLevel,
	label: string | null,
	message: string,
	newLine = true,
) {
	const logLevel = opts.level;
	const dest = opts.dest;
	const event: LogMessage = {
		label,
		level,
		message,
		newLine,
	};

	// test if this level is enabled or not
	if (!isLogLevelEnabled(logLevel, level)) {
		return; // do nothing
	}

	dest.write(event);
}

export function isLogLevelEnabled(configuredLogLevel: LoggerLevel, level: LoggerLevel) {
	return levels[configuredLogLevel] <= levels[level];
}

/** Emit a user-facing message. Useful for UI and other console messages. */
export function info(opts: LogOptions, label: string | null, message: string, newLine = true) {
	return log(opts, 'info', label, message, newLine);
}

/** Emit a warning message. Useful for high-priority messages that aren't necessarily errors. */
export function warn(opts: LogOptions, label: string | null, message: string, newLine = true) {
	return log(opts, 'warn', label, message, newLine);
}

/** Emit a error message, Useful when Astro can't recover from some error. */
export function error(opts: LogOptions, label: string | null, message: string, newLine = true) {
	return log(opts, 'error', label, message, newLine);
}

export function debug(...args: any[]) {
	if ('_astroGlobalDebug' in globalThis) {
		(globalThis as any)._astroGlobalDebug(...args);
	}
}

/**
 * Get the prefix for a log message.
 * This includes the timestamp, log level, and label all properly formatted
 * with colors. This is shared across different loggers, so it's defined here.
 */
export function getEventPrefix({ level, label }: LogMessage) {
	const timestamp = `${dateTimeFormat.format(new Date())}`;
	const prefix = [];
	if (level === 'error' || level === 'warn') {
		prefix.push(bold(timestamp));
		prefix.push(`[${level.toUpperCase()}]`);
	} else {
		prefix.push(timestamp);
	}
	if (label) {
		prefix.push(`[${label}]`);
	}
	if (level === 'error') {
		return red(prefix.join(' '));
	}
	if (level === 'warn') {
		return yellow(prefix.join(' '));
	}
	if (prefix.length === 1) {
		return dim(prefix[0]);
	}
	return dim(prefix[0]) + ' ' + blue(prefix.splice(1).join(' '));
}

/** Print out a timer message for debug() */
export function timerMessage(message: string, startTime: number = Date.now()) {
	let timeDiff = Date.now() - startTime;
	let timeDisplay =
		timeDiff < 750 ? `${Math.round(timeDiff)}ms` : `${(timeDiff / 1000).toFixed(1)}s`;
	return `${message}   ${dim(timeDisplay)}`;
}

export class Logger {
	options: LogOptions;
	constructor(options: LogOptions) {
		this.options = options;
	}

	info(label: LoggerLabel | null, message: string, newLine = true) {
		info(this.options, label, message, newLine);
	}
	warn(label: LoggerLabel | null, message: string, newLine = true) {
		warn(this.options, label, message, newLine);
	}
	error(label: LoggerLabel | null, message: string, newLine = true) {
		error(this.options, label, message, newLine);
	}
	debug(label: LoggerLabel, ...messages: any[]) {
		debug(label, ...messages);
	}

	level() {
		return this.options.level;
	}

	forkIntegrationLogger(label: string) {
		return new AstroIntegrationLogger(this.options, label);
	}
}

export class AstroIntegrationLogger {
	options: LogOptions;
	label: string;

	constructor(logging: LogOptions, label: string) {
		this.options = logging;
		this.label = label;
	}

	/**
	 * Creates a new logger instance with a new label, but the same log options.
	 */
	fork(label: string): AstroIntegrationLogger {
		return new AstroIntegrationLogger(this.options, label);
	}

	info(message: string) {
		info(this.options, this.label, message);
	}
	warn(message: string) {
		warn(this.options, this.label, message);
	}
	error(message: string) {
		error(this.options, this.label, message);
	}
	debug(message: string) {
		debug(this.label, message);
	}
}

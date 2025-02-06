import type { Writable } from 'node:stream';
import debugPackage from 'debug';
import { type LogMessage, type LogWritable, getEventPrefix, levels } from './core.js';

type ConsoleStream = Writable & {
	fd: 1 | 2;
};

export const nodeLogDestination: LogWritable<LogMessage> = {
	write(event: LogMessage) {
		let dest: ConsoleStream = process.stderr;
		if (levels[event.level] < levels['error']) {
			dest = process.stdout;
		}
		let trailingLine = event.newLine ? '\n' : '';
		if (event.label === 'SKIP_FORMAT') {
			dest.write(event.message + trailingLine);
		} else {
			dest.write(getEventPrefix(event) + ' ' + event.message + trailingLine);
		}
		return true;
	},
};

const debuggers: Record<string, debugPackage.Debugger['log']> = {};

/**
 * Emit a message only shown in debug mode.
 * Astro (along with many of its dependencies) uses the `debug` package for debug logging.
 * You can enable these logs with the `DEBUG=astro:*` environment variable.
 * More info https://github.com/debug-js/debug#environment-variables
 */
function debug(type: string, ...messages: Array<any>) {
	const namespace = `astro:${type}`;
	debuggers[namespace] = debuggers[namespace] || debugPackage(namespace);
	return debuggers[namespace](...messages);
}

// This is gross, but necessary since we are depending on globals.
(globalThis as any)._astroGlobalDebug = debug;

export function enableVerboseLogging() {
	debugPackage.enable('astro:*,vite:*');
	debug('cli', '--verbose flag enabled! Enabling: DEBUG="astro:*,vite:*"');
	debug(
		'cli',
		'Tip: Set the DEBUG env variable directly for more control. Example: "DEBUG=astro:*,vite:* astro build".',
	);
}

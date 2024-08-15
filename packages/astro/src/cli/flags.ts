import type { parseArgs } from 'node:util';
import { type LogOptions, Logger } from '../core/logger/core.js';
import { nodeLogDestination } from '../core/logger/node.js';
import type { AstroInlineConfig } from '../types/public/config.js';

export type ParsedArgsResult = ReturnType<typeof parseArgs>;
export type Flags = ParsedArgsResult['values'];

export function flagsToAstroInlineConfig(flags: Flags): AstroInlineConfig {
	return {
		// Inline-only configs
		configFile: typeof flags.config === 'string' ? flags.config : undefined,
		mode: typeof flags.mode === 'string' ? (flags.mode as AstroInlineConfig['mode']) : undefined,
		logLevel: flags.verbose ? 'debug' : flags.silent ? 'silent' : undefined,
		force: flags.force ? true : undefined,

		// Astro user configs
		root: typeof flags.root === 'string' ? flags.root : undefined,
		site: typeof flags.site === 'string' ? flags.site : undefined,
		base: typeof flags.base === 'string' ? flags.base : undefined,
		outDir: typeof flags.outDir === 'string' ? flags.outDir : undefined,
		server: {
			port: typeof flags.port === 'string' ? Number(flags.port) : undefined,
			host:
				typeof flags.host === 'string' || typeof flags.host === 'boolean' ? flags.host : undefined,
			open:
				typeof flags.open === 'string' || typeof flags.open === 'boolean' ? flags.open : undefined,
		},
	};
}

/**
 * The `logging` is usually created from an `AstroInlineConfig`, but some flows like `add`
 * doesn't read the AstroConfig directly, so we create a `logging` object from the CLI flags instead.
 */
export function createLoggerFromFlags(flags: Flags): Logger {
	const logging: LogOptions = {
		dest: nodeLogDestination,
		level: 'info',
	};

	if (flags.verbose) {
		logging.level = 'debug';
	} else if (flags.silent) {
		logging.level = 'silent';
	}

	return new Logger(logging);
}

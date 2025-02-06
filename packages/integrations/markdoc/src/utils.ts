import type { ComponentConfig } from './config.js';

/**
 * Matches AstroError object with types like error codes stubbed out
 * @see 'astro/src/core/errors/errors.ts'
 */
export class MarkdocError extends Error {
	public loc: ErrorLocation | undefined;
	public title: string | undefined;
	public hint: string | undefined;
	public frame: string | undefined;

	type = 'MarkdocError';

	constructor(props: ErrorProperties, ...params: any) {
		super(...params);

		const { title = 'MarkdocError', message, stack, location, hint, frame } = props;

		this.title = title;
		if (message) this.message = message;
		// Only set this if we actually have a stack passed, otherwise uses Error's
		this.stack = stack ? stack : this.stack;
		this.loc = location;
		this.hint = hint;
		this.frame = frame;
	}
}

interface ErrorLocation {
	file?: string;
	line?: number;
	column?: number;
}

interface ErrorProperties {
	code?: number;
	title?: string;
	name?: string;
	message?: string;
	location?: ErrorLocation;
	hint?: string;
	stack?: string;
	frame?: string;
}

/**
 * @see 'astro/src/core/path.ts'
 */
export function prependForwardSlash(str: string) {
	return str[0] === '/' ? str : '/' + str;
}

export function isValidUrl(str: string): boolean {
	try {
		new URL(str);
		return true;
	} catch {
		return false;
	}
}

/**
 * Identifies Astro components with propagated assets
 * @see 'packages/astro/src/content/consts.ts'
 */
export const PROPAGATED_ASSET_FLAG = 'astroPropagatedAssets';

/**
 * @see 'packages/astro/src/content/utils.ts'
 */
export function hasContentFlag(viteId: string, flag: string): boolean {
	const flags = new URLSearchParams(viteId.split('?')[1] ?? '');
	return flags.has(flag);
}

/** Identifier for components imports passed as `tags` or `nodes` configuration. */
export const componentConfigSymbol = Symbol.for('@astrojs/markdoc/component-config');

export function isComponentConfig(value: unknown): value is ComponentConfig {
	return typeof value === 'object' && value !== null && componentConfigSymbol in value;
}

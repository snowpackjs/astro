import type { ZodError } from 'zod';
import { codeFrame } from './printer.js';

interface ErrorProperties {
	title?: string;
	name: string;
	message?: string;
	location?: ErrorLocation;
	hint?: string;
	stack?: string;
	frame?: string;
}

export interface ErrorLocation {
	file?: string;
	line?: number;
	column?: number;
}

type ErrorTypes =
	| 'AstroError'
	| 'AstroUserError'
	| 'CompilerError'
	| 'CSSError'
	| 'MarkdownError'
	| 'InternalError'
	| 'AggregateError';

export function isAstroError(e: unknown): e is AstroError {
	return e instanceof AstroError;
}

export class AstroError extends Error {
	public loc: ErrorLocation | undefined;
	public title: string | undefined;
	public hint: string | undefined;
	public frame: string | undefined;

	type: ErrorTypes = 'AstroError';

	constructor(props: ErrorProperties, options?: ErrorOptions) {
		const { name, title, message, stack, location, hint, frame } = props;
		super(message, options);

		this.title = title;
		this.name = name;

		if (message) this.message = message;
		// Only set this if we actually have a stack passed, otherwise uses Error's
		this.stack = stack ? stack : this.stack;
		this.loc = location;
		this.hint = hint;
		this.frame = frame;
	}

	public setLocation(location: ErrorLocation): void {
		this.loc = location;
	}

	public setName(name: string): void {
		this.name = name;
	}

	public setMessage(message: string): void {
		this.message = message;
	}

	public setHint(hint: string): void {
		this.hint = hint;
	}

	public setFrame(source: string, location: ErrorLocation): void {
		this.frame = codeFrame(source, location);
	}

	static is(err: unknown): err is AstroError {
		return (err as AstroError).type === 'AstroError';
	}
}

export class CompilerError extends AstroError {
	type: ErrorTypes = 'CompilerError';

	constructor(props: ErrorProperties, options?: ErrorOptions) {
		super(props, options);
	}

	static is(err: unknown): err is CompilerError {
		return (err as CompilerError).type === 'CompilerError';
	}
}

export class CSSError extends AstroError {
	type: ErrorTypes = 'CSSError';

	static is(err: unknown): err is CSSError {
		return (err as CSSError).type === 'CSSError';
	}
}

export class MarkdownError extends AstroError {
	type: ErrorTypes = 'MarkdownError';

	static is(err: unknown): err is MarkdownError {
		return (err as MarkdownError).type === 'MarkdownError';
	}
}

export class InternalError extends AstroError {
	type: ErrorTypes = 'InternalError';

	static is(err: unknown): err is InternalError {
		return (err as InternalError).type === 'InternalError';
	}
}

export class AggregateError extends AstroError {
	type: ErrorTypes = 'AggregateError';
	errors: AstroError[];

	// Despite being a collection of errors, AggregateError still needs to have a main error attached to it
	// This is because Vite expects every thrown errors handled during HMR to be, well, Error and have a message
	constructor(props: ErrorProperties & { errors: AstroError[] }, options?: ErrorOptions) {
		super(props, options);

		this.errors = props.errors;
	}

	static is(err: unknown): err is AggregateError {
		return (err as AggregateError).type === 'AggregateError';
	}
}

const astroConfigZodErrors = new WeakSet<ZodError>();

/**
 * Check if an error is a ZodError from an AstroConfig validation.
 * Used to suppress formatting a ZodError if needed.
 */
export function isAstroConfigZodError(error: unknown): error is ZodError {
	return astroConfigZodErrors.has(error as ZodError);
}

/**
 * Track that a ZodError comes from an AstroConfig validation.
 */
export function trackAstroConfigZodError(error: ZodError): void {
	astroConfigZodErrors.add(error);
}

/**
 * Generic object representing an error with all possible data
 * Compatible with both Astro's and Vite's errors
 */
export interface ErrorWithMetadata {
	[name: string]: any;
	name: string;
	title?: string;
	type?: ErrorTypes;
	message: string;
	stack: string;
	hint?: string;
	id?: string;
	frame?: string;
	plugin?: string;
	pluginCode?: string;
	fullCode?: string;
	loc?: {
		file?: string;
		line?: number;
		column?: number;
	};
	cause?: any;
}

/**
 * Special error that is exposed to users.
 * Compared to AstroError, it contains a subset of information.
 */
export class AstroUserError extends Error {
	type: ErrorTypes = 'AstroUserError';
	/**
	 * A message that explains to the user how they can fix the error.
	 */
	hint: string | undefined;
	name = 'AstroUserError';
	constructor(message: string, hint?: string) {
		super();
		this.message = message;
		this.hint = hint;
	}

	static is(err: unknown): err is AstroUserError {
		return (err as AstroUserError).type === 'AstroUserError';
	}
}

import { LibsqlError } from '@libsql/client';
import { AstroError } from 'astro/errors';

const isWindows = process?.platform === 'win32';

/**
 * Small wrapper around fetch that throws an error if the response is not OK. Allows for custom error handling as well through the onNotOK callback.
 */
export async function safeFetch(
	url: Parameters<typeof fetch>[0],
	options: Parameters<typeof fetch>[1] = {},
	onNotOK: (response: Response) => void | Promise<void> = () => {
		throw new Error(`Request to ${url} returned a non-OK status code.`);
	},
): Promise<Response> {
	const response = await fetch(url, options);

	if (!response.ok) {
		await onNotOK(response);
	}

	return response;
}

export class AstroDbError extends AstroError {
	name = 'Astro DB Error';
}

export class DetailedLibsqlError extends LibsqlError {
	name = 'Astro DB Error';
	hint?: string;

	constructor({
		message,
		code,
		hint,
		rawCode,
		cause,
	}: { message: string; code: string; hint?: string; rawCode?: number; cause?: Error }) {
		super(message, code, rawCode, cause);
		this.hint = hint;
	}
}

export function isDbError(err: unknown): err is LibsqlError {
	return err instanceof LibsqlError || (err instanceof Error && (err as any).libsqlError === true);
}

function slash(path: string) {
	const isExtendedLengthPath = path.startsWith('\\\\?\\');

	if (isExtendedLengthPath) {
		return path;
	}

	return path.replace(/\\/g, '/');
}

export function pathToFileURL(path: string): URL {
	if (isWindows) {
		let slashed = slash(path);
		// Windows like C:/foo/bar
		if (!slashed.startsWith('/')) {
			slashed = '/' + slashed;
		}
		return new URL('file://' + slashed);
	}

	// Unix is easy
	return new URL('file://' + path);
}

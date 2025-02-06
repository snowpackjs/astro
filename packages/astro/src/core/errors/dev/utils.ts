import * as fs from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripVTControlCharacters } from 'node:util';
import { escape } from 'html-escaper';
import { bold, underline } from 'kleur/colors';
import type { ESBuildTransformResult } from 'vite';
import type { SSRError } from '../../../types/public/internal.js';
import { removeLeadingForwardSlashWindows } from '../../path.js';
import { normalizePath } from '../../viteUtils.js';
import { AggregateError, type ErrorWithMetadata } from '../errors.js';
import { AstroErrorData } from '../index.js';
import { codeFrame } from '../printer.js';
import { normalizeLF } from '../utils.js';

type EsbuildMessage = ESBuildTransformResult['warnings'][number];

/**
 * Takes any error-like object and returns a standardized Error + metadata object.
 * Useful for consistent reporting regardless of where the error surfaced from.
 */
export function collectErrorMetadata(e: any, rootFolder?: URL): ErrorWithMetadata {
	const err =
		AggregateError.is(e) || Array.isArray(e.errors) ? (e.errors as SSRError[]) : [e as SSRError];

	err.forEach((error) => {
		if (e.stack) {
			const stackInfo = collectInfoFromStacktrace(e);
			try {
				error.stack = stripVTControlCharacters(stackInfo.stack);
			} catch {}
			error.loc = stackInfo.loc;
			error.plugin = stackInfo.plugin;
			error.pluginCode = stackInfo.pluginCode;
		}

		// Make sure the file location is absolute, otherwise:
		// - It won't be clickable in the terminal
		// - We'll fail to show the file's content in the browser
		// - We'll fail to show the code frame in the terminal
		// - The "Open in Editor" button won't work

		// Normalize the paths so that we can correctly detect if it's absolute on any platform
		const normalizedFile = normalizePath(error.loc?.file || '');
		const normalizedRootFolder = removeLeadingForwardSlashWindows(rootFolder?.pathname || '');

		if (
			error.loc?.file &&
			rootFolder &&
			(!normalizedFile?.startsWith(normalizedRootFolder) || !isAbsolute(normalizedFile))
		) {
			error.loc.file = join(fileURLToPath(rootFolder), error.loc.file);
		}

		// If we don't have a frame, but we have a location let's try making up a frame for it
		if (error.loc && (!error.frame || !error.fullCode)) {
			try {
				const fileContents = fs.readFileSync(error.loc.file!, 'utf8');

				if (!error.frame) {
					const frame = codeFrame(fileContents, error.loc);
					error.frame = stripVTControlCharacters(frame);
				}

				if (!error.fullCode) {
					error.fullCode = fileContents;
				}
			} catch {}
		}

		// Generic error (probably from Vite, and already formatted)
		error.hint = generateHint(e);

		// Strip ANSI for `message` property. Note that ESBuild errors may not have the property,
		// but it will be handled and added below, which is already ANSI-free
		if (error.message) {
			try {
				error.message = stripVTControlCharacters(error.message);
			} catch {
				// Setting `error.message` can fail here if the message is read-only, which for the vast majority of cases will never happen, however some somewhat obscure cases can cause this to happen.
			}
		}
	});

	// If we received an array of errors and it's not from us, it's most likely from ESBuild, try to extract info for Vite to display
	// NOTE: We still need to be defensive here, because it might not necessarily be from ESBuild, it's just fairly likely.
	if (!AggregateError.is(e) && Array.isArray(e.errors)) {
		(e.errors as EsbuildMessage[]).forEach((buildError, i) => {
			const { location, pluginName, text } = buildError;

			// ESBuild can give us a slightly better error message than the one in the error, so let's use it
			if (text) {
				try {
					err[i].message = text;
				} catch {}
			}

			if (location) {
				err[i].loc = { file: location.file, line: location.line, column: location.column };
				err[i].id = err[0].id || location?.file;
			}

			// Vite adds the error message to the frame for ESBuild errors, we don't want that
			if (err[i].frame) {
				const errorLines = err[i].frame?.trim().split('\n');

				if (errorLines) {
					err[i].frame = !/^\d/.test(errorLines[0])
						? errorLines?.slice(1).join('\n')
						: err[i].frame;
				}
			}

			const possibleFilePath = location?.file ?? err[i].id;
			if (possibleFilePath && err[i].loc && (!err[i].frame || !err[i].fullCode)) {
				try {
					const fileContents = fs.readFileSync(possibleFilePath, 'utf8');
					if (!err[i].frame) {
						err[i].frame = codeFrame(fileContents, { ...err[i].loc, file: possibleFilePath });
					}

					err[i].fullCode = fileContents;
				} catch {
					err[i].fullCode = err[i].pluginCode;
				}
			}

			if (pluginName) {
				err[i].plugin = pluginName;
			}

			err[i].hint = generateHint(err[0]);
		});
	}

	// TODO: Handle returning multiple errors
	return err[0];
}

function generateHint(err: ErrorWithMetadata): string | undefined {
	const commonBrowserAPIs = ['document', 'window'];

	if (/Unknown file extension "\.(?:jsx|vue|svelte|astro|css)" for /.test(err.message)) {
		return 'You likely need to add this package to `vite.ssr.noExternal` in your astro config file.';
	} else if (commonBrowserAPIs.some((api) => err.toString().includes(api))) {
		const hint = `Browser APIs are not available on the server.

${
	err.loc?.file?.endsWith('.astro')
		? 'Move your code to a <script> tag outside of the frontmatter, so the code runs on the client.'
		: 'If the code is in a framework component, try to access these objects after rendering using lifecycle methods or use a `client:only` directive to make the component exclusively run on the client.'
}

See https://docs.astro.build/en/guides/troubleshooting/#document-or-window-is-not-defined for more information.
		`;
		return hint;
	}
	return err.hint;
}

type StackInfo = Pick<SSRError, 'stack' | 'loc' | 'plugin' | 'pluginCode'>;

function collectInfoFromStacktrace(error: SSRError & { stack: string }): StackInfo {
	let stackInfo: StackInfo = {
		stack: error.stack,
		plugin: error.plugin,
		pluginCode: error.pluginCode,
		loc: error.loc,
	};

	// normalize error stack line-endings to \n
	stackInfo.stack = normalizeLF(error.stack);
	const stackText = stripVTControlCharacters(error.stack);

	// Try to find possible location from stack if we don't have one
	if (!stackInfo.loc || (!stackInfo.loc.column && !stackInfo.loc.line)) {
		const possibleFilePath =
			error.loc?.file ||
			error.pluginCode ||
			error.id ||
			// TODO: this could be better, `src` might be something else
			stackText
				.split('\n')
				.find((ln) => ln.includes('src') || ln.includes('node_modules'));
		// Disable eslint as we're not sure how to improve this regex yet
		// eslint-disable-next-line regexp/no-super-linear-backtracking
		const source = possibleFilePath?.replace?.(/^[^(]+\(([^)]+).*$/, '$1').replace(/^\s+at\s+/, '');

		let file = source?.replace(/:\d+/g, '');
		const location = /:(\d+):(\d+)/.exec(source!) ?? [];
		const line = location[1];
		const column = location[2];

		if (file && line && column) {
			try {
				file = fileURLToPath(file);
			} catch {}

			stackInfo.loc = {
				file,
				line: Number.parseInt(line),
				column: Number.parseInt(column),
			};
		}
	}

	// Derive plugin from stack (if possible)
	if (!stackInfo.plugin) {
		stackInfo.plugin =
			/withastro\/astro\/packages\/integrations\/([\w-]+)/i.exec(stackText)?.at(1) ||
			/(@astrojs\/[\w-]+)\/(server|client|index)/i.exec(stackText)?.at(1) ||
			undefined;
	}

	// Normalize stack (remove `/@fs/` urls, etc)
	stackInfo.stack = cleanErrorStack(error.stack);

	return stackInfo;
}

function cleanErrorStack(stack: string) {
	return stack
		.split(/\n/)
		.map((l) => l.replace(/\/@fs\//g, '/'))
		.join('\n');
}

export function getDocsForError(err: ErrorWithMetadata): string | undefined {
	if (err.name !== 'UnknownError' && err.name in AstroErrorData) {
		return `https://docs.astro.build/en/reference/errors/${getKebabErrorName(err.name)}/`;
	}

	return undefined;

	/**
	 * The docs has kebab-case urls for errors, so we need to convert the error name
	 * @param errorName
	 */
	function getKebabErrorName(errorName: string): string {
		return errorName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	}
}

const linkRegex = /\[([^[]+)\]\((.*)\)/g;
const boldRegex = /\*\*(.+)\*\*/g;
const urlRegex = / ((?:https?|ftp):\/\/[-\w+&@#\\/%?=~|!:,.;]*[-\w+&@#\\/%=~|])/gi;
const codeRegex = /`([^`]+)`/g;

/**
 * Render a subset of Markdown to HTML or a CLI output
 */
export function renderErrorMarkdown(markdown: string, target: 'html' | 'cli') {
	if (target === 'html') {
		return escape(markdown)
			.replace(linkRegex, `<a href="$2" target="_blank">$1</a>`)
			.replace(boldRegex, '<b>$1</b>')
			.replace(urlRegex, ' <a href="$1" target="_blank">$1</a>')
			.replace(codeRegex, '<code>$1</code>');
	} else {
		return markdown
			.replace(linkRegex, (_, m1, m2) => `${bold(m1)} ${underline(m2)}`)
			.replace(urlRegex, (fullMatch) => ` ${underline(fullMatch.trim())}`)
			.replace(boldRegex, (_, m1) => `${bold(m1)}`);
	}
}

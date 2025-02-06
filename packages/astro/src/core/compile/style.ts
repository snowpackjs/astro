import fs from 'node:fs';
import type { TransformOptions } from '@astrojs/compiler';
import { type ResolvedConfig, preprocessCSS } from 'vite';
import { AstroErrorData, CSSError, positionAt } from '../errors/index.js';
import { normalizePath } from '../viteUtils.js';
import type { CompileCssResult } from './types.js';

export type PartialCompileCssResult = Pick<CompileCssResult, 'isGlobal' | 'dependencies'>;

export function createStylePreprocessor({
	filename,
	viteConfig,
	cssPartialCompileResults,
	cssTransformErrors,
}: {
	filename: string;
	viteConfig: ResolvedConfig;
	cssPartialCompileResults: Partial<CompileCssResult>[];
	cssTransformErrors: Error[];
}): TransformOptions['preprocessStyle'] {
	let processedStylesCount = 0;

	return async (content, attrs) => {
		const index = processedStylesCount++;
		const lang = `.${attrs?.lang || 'css'}`.toLowerCase();
		const id = `${filename}?astro&type=style&index=${index}&lang${lang}`;
		try {
			const result = await preprocessCSS(content, id, viteConfig);

			cssPartialCompileResults[index] = {
				isGlobal: !!attrs['is:global'],
				dependencies: result.deps ? [...result.deps].map((dep) => normalizePath(dep)) : [],
			};

			let map: string | undefined;
			if (result.map) {
				if (typeof result.map === 'string') {
					map = result.map;
				} else if (result.map.mappings) {
					map = result.map.toString();
				}
			}

			return { code: result.code, map };
		} catch (err: any) {
			try {
				err = enhanceCSSError(err, filename, content);
			} catch {}
			cssTransformErrors.push(err);
			return { error: err + '' };
		}
	};
}

function enhanceCSSError(err: any, filename: string, cssContent: string) {
	const fileContent = fs.readFileSync(filename).toString();
	const styleTagBeginning = fileContent.indexOf(cssContent);

	// PostCSS Syntax Error
	if (err.name === 'CssSyntaxError') {
		const errorLine = positionAt(styleTagBeginning, fileContent).line + (err.line ?? 0);

		// Vite will handle creating the frame for us with proper line numbers, no need to create one

		return new CSSError({
			...AstroErrorData.CSSSyntaxError,
			message: err.reason,
			location: {
				file: filename,
				line: errorLine,
				column: err.column,
			},
			stack: err.stack,
		});
	}

	// Some CSS processor will return a line and a column, so let's try to show a pretty error
	if (err.line && err.column) {
		const errorLine = positionAt(styleTagBeginning, fileContent).line + (err.line ?? 0);

		return new CSSError({
			...AstroErrorData.UnknownCSSError,
			message: err.message,
			location: {
				file: filename,
				line: errorLine,
				column: err.column,
			},
			frame: err.frame,
			stack: err.stack,
		});
	}

	// For other errors we'll just point to the beginning of the style tag
	const errorPosition = positionAt(styleTagBeginning, fileContent);
	errorPosition.line += 1;

	return new CSSError({
		name: 'CSSError',
		message: err.message,
		location: {
			file: filename,
			line: errorPosition.line,
			column: 0,
		},
		frame: err.frame,
		stack: err.stack,
	});
}

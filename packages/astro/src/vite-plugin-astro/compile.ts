import { type ESBuildTransformResult, transformWithEsbuild } from 'vite';
import { type CompileProps, type CompileResult, compile } from '../core/compile/index.js';
import type { Logger } from '../core/logger/core.js';
import type { AstroConfig } from '../types/public/config.js';
import { getFileInfo } from '../vite-plugin-utils/index.js';
import type { CompileMetadata } from './types.js';
import { frontmatterRE } from './utils.js';

interface CompileAstroOption {
	compileProps: CompileProps;
	astroFileToCompileMetadata: Map<string, CompileMetadata>;
	logger: Logger;
}

export interface CompileAstroResult extends Omit<CompileResult, 'map'> {
	map: ESBuildTransformResult['map'];
}

interface EnhanceCompilerErrorOptions {
	err: Error;
	id: string;
	source: string;
	config: AstroConfig;
	logger: Logger;
}

export async function compileAstro({
	compileProps,
	astroFileToCompileMetadata,
	logger,
}: CompileAstroOption): Promise<CompileAstroResult> {
	let transformResult: CompileResult;
	let esbuildResult: ESBuildTransformResult;

	try {
		transformResult = await compile(compileProps);
		// Compile all TypeScript to JavaScript.
		// Also, catches invalid JS/TS in the compiled output before returning.
		esbuildResult = await transformWithEsbuild(transformResult.code, compileProps.filename, {
			...compileProps.viteConfig.esbuild,
			loader: 'ts',
			sourcemap: 'external',
			tsconfigRaw: {
				compilerOptions: {
					// Ensure client:only imports are treeshaken
					verbatimModuleSyntax: false,
					importsNotUsedAsValues: 'remove',
				},
			},
		});
	} catch (err: any) {
		await enhanceCompileError({
			err,
			id: compileProps.filename,
			source: compileProps.source,
			config: compileProps.astroConfig,
			logger: logger,
		});
		throw err;
	}

	const { fileId: file, fileUrl: url } = getFileInfo(
		compileProps.filename,
		compileProps.astroConfig,
	);

	let SUFFIX = '';
	SUFFIX += `\nconst $$file = ${JSON.stringify(file)};\nconst $$url = ${JSON.stringify(
		url,
	)};export { $$file as file, $$url as url };\n`;

	// Add HMR handling in dev mode.
	if (!compileProps.viteConfig.isProduction) {
		let i = 0;
		while (i < transformResult.scripts.length) {
			SUFFIX += `import "${compileProps.filename}?astro&type=script&index=${i}&lang.ts";`;
			i++;
		}
	}

	// Attach compile metadata to map for use by virtual modules
	astroFileToCompileMetadata.set(compileProps.filename, {
		originalCode: compileProps.source,
		css: transformResult.css,
		scripts: transformResult.scripts,
	});

	return {
		...transformResult,
		code: esbuildResult.code + SUFFIX,
		map: esbuildResult.map,
	};
}

async function enhanceCompileError({
	err,
	id,
	source,
}: EnhanceCompilerErrorOptions): Promise<void> {
	const lineText = (err as any).loc?.lineText;
	// Verify frontmatter: a common reason that this plugin fails is that
	// the user provided invalid JS/TS in the component frontmatter.
	// If the frontmatter is invalid, the `err` object may be a compiler
	// panic or some other vague/confusing compiled error message.
	//
	// Before throwing, it is better to verify the frontmatter here, and
	// let esbuild throw a more specific exception if the code is invalid.
	// If frontmatter is valid or cannot be parsed, then continue.
	const scannedFrontmatter = frontmatterRE.exec(source);
	if (scannedFrontmatter) {
		// Top-level return is not supported, so replace `return` with throw
		const frontmatter = scannedFrontmatter[1].replace(/\breturn\b/g, 'throw');

		// If frontmatter does not actually include the offending line, skip
		if (lineText && !frontmatter.includes(lineText)) throw err;

		try {
			await transformWithEsbuild(frontmatter, id, {
				loader: 'ts',
				target: 'esnext',
				sourcemap: false,
			});
		} catch (frontmatterErr: any) {
			// Improve the error by replacing the phrase "unexpected end of file"
			// with "unexpected end of frontmatter" in the esbuild error message.
			if (frontmatterErr?.message) {
				frontmatterErr.message = frontmatterErr.message.replace(
					'end of file',
					'end of frontmatter',
				);
			}
			throw frontmatterErr;
		}
	}

	throw err;
}

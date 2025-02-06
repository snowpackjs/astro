import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import esbuild from 'esbuild';
import glob from 'fast-glob';
import { red } from 'kleur/colors';

function escapeTemplateLiterals(str) {
	return str.replace(/\`/g, '\\`').replace(/\$\{/g, '\\${');
}

export default async function prebuild(...args) {
	let buildToString = args.indexOf('--to-string');
	if (buildToString !== -1) {
		args.splice(buildToString, 1);
		buildToString = true;
	}
	let minify = true;
	let minifyIdx = args.indexOf('--no-minify');
	if (minifyIdx !== -1) {
		minify = false;
		args.splice(minifyIdx, 1);
	}

	let patterns = args;
	// NOTE: absolute paths returned are forward slashes on windows
	let entryPoints = [].concat(
		...(await Promise.all(
			patterns.map((pattern) => glob(pattern, { onlyFiles: true, absolute: true })),
		)),
	);

	function getPrebuildURL(entryfilepath, dev = false) {
		const entryURL = pathToFileURL(entryfilepath);
		const basename = path.basename(entryfilepath);
		const ext = path.extname(entryfilepath);
		const name = basename.slice(0, basename.indexOf(ext));
		const outname = dev ? `${name}.prebuilt-dev${ext}` : `${name}.prebuilt${ext}`;
		const outURL = new URL('./' + outname, entryURL);
		return outURL;
	}

	async function prebuildFile(filepath) {
		let tscode = await fs.promises.readFile(filepath, 'utf-8');
		// If we're bundling a client directive, modify the code to match `packages/astro/src/core/client-directive/build.ts`.
		// If updating this code, make sure to also update that file.
		if (filepath.includes('runtime/client')) {
			// `export default xxxDirective` is a convention used in the current client directives that we use
			// to make sure we bundle this right. We'll error below if this convention isn't followed.
			const newTscode = tscode.replace(
				/export default (.*?)Directive/,
				(_, name) =>
					`(self.Astro || (self.Astro = {})).${name} = ${name}Directive;window.dispatchEvent(new Event('astro:${name}'))`,
			);
			if (newTscode === tscode) {
				console.error(
					red(
						`${filepath} doesn't follow the \`export default xxxDirective\` convention. The prebuilt output may be wrong. ` +
							`For more information, check out ${fileURLToPath(import.meta.url)}`,
					),
				);
			}
			tscode = newTscode;
		}

		const esbuildOptions = {
			stdin: {
				contents: tscode,
				resolveDir: path.dirname(filepath),
				loader: 'ts',
				sourcefile: filepath,
			},
			format: 'iife',
			target: ['es2018'],
			minify,
			bundle: true,
			write: false,
		};

		const results = await Promise.all(
			[
				{
					build: await esbuild.build(esbuildOptions),
					dev: false,
				},
				filepath.includes('astro-island')
					? {
							build: await esbuild.build({
								...esbuildOptions,
								define: { 'process.env.NODE_ENV': '"development"' },
							}),
							dev: true,
						}
					: undefined,
			].filter((entry) => entry),
		);

		for (const result of results) {
			const code = result.build.outputFiles[0].text.trim();
			const rootURL = new URL('../../', import.meta.url);
			const rel = path.relative(fileURLToPath(rootURL), filepath);
			const mod = `/**
 * This file is prebuilt from ${rel}
 * Do not edit this directly, but instead edit that file and rerun the prebuild
 * to generate this file.
 */

export default \`${escapeTemplateLiterals(code)}\`;`;
			const url = getPrebuildURL(filepath, result.dev);
			await fs.promises.writeFile(url, mod, 'utf-8');
		}
	}

	await Promise.all(entryPoints.map(prebuildFile));
}

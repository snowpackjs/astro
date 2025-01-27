import type { SSRError } from 'astro';
import { getAstroMetadata } from 'astro/jsx/rehype.js';
import { VFile } from 'vfile';
import type { Plugin } from 'vite';
import type { MdxOptions } from './index.js';
import { createMdxProcessor } from './plugins.js';
import { safeParseFrontmatter } from './utils.js';

export interface VitePluginMdxOptions {
	mdxOptions: MdxOptions;
	srcDir: URL;
}

// NOTE: Do not destructure `opts` as we're assigning a reference that will be mutated later
export function vitePluginMdx(opts: VitePluginMdxOptions): Plugin {
	let processor: ReturnType<typeof createMdxProcessor> | undefined;
	let sourcemapEnabled: boolean;

	return {
		name: '@mdx-js/rollup',
		enforce: 'pre',
		buildEnd() {
			processor = undefined;
		},
		configResolved(resolved) {
			sourcemapEnabled = !!resolved.build.sourcemap;

			// HACK: Remove the `astro:jsx` plugin if defined as we handle the JSX transformation ourselves
			const jsxPluginIndex = resolved.plugins.findIndex((p) => p.name === 'astro:jsx');
			if (jsxPluginIndex !== -1) {
				// @ts-ignore-error ignore readonly annotation
				resolved.plugins.splice(jsxPluginIndex, 1);
			}
		},
		async resolveId(source, importer, options) {
			if (importer?.endsWith('.mdx') && source[0] !== '/') {
				let resolved = await this.resolve(source, importer, options);
				if (!resolved) resolved = await this.resolve('./' + source, importer, options);
				return resolved;
			}
		},
		// Override transform to alter code before MDX compilation
		// ex. inject layouts
		async transform(code, id) {
			if (!id.endsWith('.mdx')) return;

			const { frontmatter, content } = safeParseFrontmatter(code, id);

			const vfile = new VFile({
				value: content,
				path: id,
				data: {
					astro: {
						frontmatter,
					},
					applyFrontmatterExport: {
						srcDir: opts.srcDir,
					},
				},
			});

			// Lazily initialize the MDX processor
			if (!processor) {
				processor = createMdxProcessor(opts.mdxOptions, { sourcemap: sourcemapEnabled });
			}

			try {
				const compiled = await processor.process(vfile);

				return {
					code: String(compiled.value),
					map: compiled.map,
					meta: getMdxMeta(vfile),
				};
			} catch (e: any) {
				const err: SSRError = e;

				// For some reason MDX puts the error location in the error's name, not very useful for us.
				err.name = 'MDXError';
				err.loc = { file: id, line: e.line, column: e.column };

				// For another some reason, MDX doesn't include a stack trace. Weird
				Error.captureStackTrace(err);

				throw err;
			}
		},
	};
}

function getMdxMeta(vfile: VFile): Record<string, any> {
	const astroMetadata = getAstroMetadata(vfile);
	if (!astroMetadata) {
		throw new Error(
			'Internal MDX error: Astro metadata is not set by rehype-analyze-astro-metadata',
		);
	}
	return {
		astro: astroMetadata,
		vite: {
			// Setting this vite metadata to `ts` causes Vite to resolve .js
			// extensions to .ts files.
			lang: 'ts',
		},
	};
}

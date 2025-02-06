import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
	type MarkdownProcessor,
	createMarkdownProcessor,
	isFrontmatterValid,
} from '@astrojs/markdown-remark';
import type { Plugin } from 'vite';
import { safeParseFrontmatter } from '../content/utils.js';
import { AstroError, AstroErrorData } from '../core/errors/index.js';
import type { Logger } from '../core/logger/core.js';
import { isMarkdownFile, isPage } from '../core/util.js';
import { normalizePath } from '../core/viteUtils.js';
import { shorthash } from '../runtime/server/shorthash.js';
import type { AstroSettings } from '../types/astro.js';
import { createDefaultAstroMetadata } from '../vite-plugin-astro/metadata.js';
import { getFileInfo } from '../vite-plugin-utils/index.js';
import { type MarkdownImagePath, getMarkdownCodeForImages } from './images.js';

interface AstroPluginOptions {
	settings: AstroSettings;
	logger: Logger;
}

const astroServerRuntimeModulePath = normalizePath(
	fileURLToPath(new URL('../runtime/server/index.js', import.meta.url)),
);

const astroErrorModulePath = normalizePath(
	fileURLToPath(new URL('../core/errors/index.js', import.meta.url)),
);

export default function markdown({ settings, logger }: AstroPluginOptions): Plugin {
	let processor: Promise<MarkdownProcessor> | undefined;

	return {
		enforce: 'pre',
		name: 'astro:markdown',
		buildEnd() {
			processor = undefined;
		},
		async resolveId(source, importer, options) {
			if (importer?.endsWith('.md') && source[0] !== '/') {
				let resolved = await this.resolve(source, importer, options);
				if (!resolved) resolved = await this.resolve('./' + source, importer, options);
				return resolved;
			}
		},
		// Why not the "transform" hook instead of "load" + readFile?
		// A: Vite transforms all "import.meta.env" references to their values before
		// passing to the transform hook. This lets us get the truly raw value
		// to escape "import.meta.env" ourselves.
		async load(id) {
			if (isMarkdownFile(id)) {
				const { fileId, fileUrl } = getFileInfo(id, settings.config);
				const rawFile = await fs.promises.readFile(fileId, 'utf-8');
				const raw = safeParseFrontmatter(rawFile, id);

				const fileURL = pathToFileURL(fileId);

				// Lazily initialize the Markdown processor
				if (!processor) {
					processor = createMarkdownProcessor(settings.config.markdown);
				}

				const renderResult = await (await processor).render(raw.content, {
					// @ts-expect-error passing internal prop
					fileURL,
					frontmatter: raw.frontmatter,
				});

				// Improve error message for invalid astro frontmatter
				if (!isFrontmatterValid(renderResult.metadata.frontmatter)) {
					throw new AstroError(AstroErrorData.InvalidFrontmatterInjectionError);
				}

				let html = renderResult.code;
				const { headings, imagePaths: rawImagePaths, frontmatter } = renderResult.metadata;

				// Add default charset for markdown pages
				const isMarkdownPage = isPage(fileURL, settings);
				const charset = isMarkdownPage ? '<meta charset="utf-8">' : '';

				// Resolve all the extracted images from the content
				const imagePaths: MarkdownImagePath[] = [];
				for (const imagePath of rawImagePaths) {
					imagePaths.push({
						raw: imagePath,
						safeName: shorthash(imagePath),
					});
				}

				const { layout } = frontmatter;

				if (frontmatter.setup) {
					logger.warn(
						'markdown',
						`[${id}] Astro now supports MDX! Support for components in ".md" (or alternative extensions like ".markdown") files using the "setup" frontmatter is no longer enabled by default. Migrate this file to MDX.`,
					);
				}

				const code = `
				import { unescapeHTML, spreadAttributes, createComponent, render, renderComponent, maybeRenderHead } from ${JSON.stringify(
					astroServerRuntimeModulePath,
				)};
				import { AstroError, AstroErrorData } from ${JSON.stringify(astroErrorModulePath)};
				${layout ? `import Layout from ${JSON.stringify(layout)};` : ''}

				${
					// Only include the code relevant to `astro:assets` if there's images in the file
					imagePaths.length > 0
						? getMarkdownCodeForImages(imagePaths, html)
						: `const html = () => ${JSON.stringify(html)};`
				}

				export const frontmatter = ${JSON.stringify(frontmatter)};
				export const file = ${JSON.stringify(fileId)};
				export const url = ${JSON.stringify(fileUrl)};
				export function rawContent() {
					return ${JSON.stringify(raw.content)};
				}
				export async function compiledContent() {
					return await html();
				}
				export function getHeadings() {
					return ${JSON.stringify(headings)};
				}

				export const Content = createComponent((result, _props, slots) => {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;

					return ${
						layout
							? `render\`\${renderComponent(result, 'Layout', Layout, {
								file,
								url,
								content,
								frontmatter: content,
								headings: getHeadings(),
								rawContent,
								compiledContent,
								'server:root': true,
							}, {
								'default': () => render\`\${unescapeHTML(html())}\`
							})}\`;`
							: `render\`${charset}\${maybeRenderHead(result)}\${unescapeHTML(html())}\`;`
					}
				});
				export default Content;
				`;

				return {
					code,
					meta: {
						astro: createDefaultAstroMetadata(),
						vite: {
							lang: 'ts',
						},
					},
				};
			}
		},
	};
}

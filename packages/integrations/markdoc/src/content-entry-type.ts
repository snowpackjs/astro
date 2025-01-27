import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import type { Config as MarkdocConfig, Node } from '@markdoc/markdoc';
import Markdoc from '@markdoc/markdoc';
import type { AstroConfig, ContentEntryType } from 'astro';
import { emitESMImage } from 'astro/assets/utils';
import type { Rollup, ErrorPayload as ViteErrorPayload } from 'vite';
import type { ComponentConfig } from './config.js';
import { htmlTokenTransform } from './html/transform/html-token-transform.js';
import type { MarkdocConfigResult } from './load-config.js';
import type { MarkdocIntegrationOptions } from './options.js';
import { setupConfig } from './runtime.js';
import { getMarkdocTokenizer } from './tokenizer.js';
import { MarkdocError, isComponentConfig, isValidUrl, prependForwardSlash } from './utils.js';

export async function getContentEntryType({
	markdocConfigResult,
	astroConfig,
	options,
}: {
	astroConfig: AstroConfig;
	markdocConfigResult?: MarkdocConfigResult;
	options?: MarkdocIntegrationOptions;
}): Promise<ContentEntryType> {
	return {
		extensions: ['.mdoc'],
		getEntryInfo({ fileUrl, contents }) {
			const parsed = safeParseFrontmatter(contents, fileURLToPath(fileUrl));
			return {
				data: parsed.frontmatter,
				body: parsed.content.trim(),
				slug: parsed.frontmatter.slug,
				rawData: parsed.rawFrontmatter,
			};
		},
		handlePropagation: true,
		async getRenderModule({ contents, fileUrl, viteId }) {
			const parsed = safeParseFrontmatter(contents, fileURLToPath(fileUrl));
			const tokenizer = getMarkdocTokenizer(options);
			let tokens = tokenizer.tokenize(parsed.content);

			if (options?.allowHTML) {
				tokens = htmlTokenTransform(tokenizer, tokens);
			}

			const ast = Markdoc.parse(tokens);
			const userMarkdocConfig = markdocConfigResult?.config ?? {};
			const markdocConfigUrl = markdocConfigResult?.fileUrl;
			const pluginContext = this;
			const markdocConfig = await setupConfig(userMarkdocConfig, options);
			const filePath = fileURLToPath(fileUrl);
			raiseValidationErrors({
				ast,
				/* Raised generics issue with Markdoc core https://github.com/markdoc/markdoc/discussions/400 */
				markdocConfig: markdocConfig as MarkdocConfig,
				viteId,
				astroConfig,
				filePath,
			});
			await resolvePartials({
				ast,
				markdocConfig: markdocConfig as MarkdocConfig,
				fileUrl,
				allowHTML: options?.allowHTML,
				tokenizer,
				pluginContext,
				root: astroConfig.root,
				raisePartialValidationErrors: (partialAst, partialPath) => {
					raiseValidationErrors({
						ast: partialAst,
						markdocConfig: markdocConfig as MarkdocConfig,
						viteId,
						astroConfig,
						filePath: partialPath,
					});
				},
			});

			const usedTags = getUsedTags(ast);

			let componentConfigByTagMap: Record<string, ComponentConfig> = {};
			// Only include component imports for tags used in the document.
			// Avoids style and script bleed.
			for (const tag of usedTags) {
				const render = markdocConfig.tags?.[tag]?.render;
				if (isComponentConfig(render)) {
					componentConfigByTagMap[tag] = render;
				}
			}
			let componentConfigByNodeMap: Record<string, ComponentConfig> = {};
			for (const [nodeType, schema] of Object.entries(markdocConfig.nodes ?? {})) {
				const render = schema?.render;
				if (isComponentConfig(render)) {
					componentConfigByNodeMap[nodeType] = render;
				}
			}

			await emitOptimizedImages(ast.children, {
				astroConfig,
				pluginContext,
				filePath,
			});

			const res = `import { Renderer } from '@astrojs/markdoc/components';
import { createGetHeadings, createContentComponent } from '@astrojs/markdoc/runtime';
${
	markdocConfigUrl
		? `import markdocConfig from ${JSON.stringify(fileURLToPath(markdocConfigUrl))};`
		: 'const markdocConfig = {};'
}

import { assetsConfig } from '@astrojs/markdoc/runtime-assets-config';
markdocConfig.nodes = { ...assetsConfig.nodes, ...markdocConfig.nodes };

${getStringifiedImports(componentConfigByTagMap, 'Tag', astroConfig.root)}
${getStringifiedImports(componentConfigByNodeMap, 'Node', astroConfig.root)}

const tagComponentMap = ${getStringifiedMap(componentConfigByTagMap, 'Tag')};
const nodeComponentMap = ${getStringifiedMap(componentConfigByNodeMap, 'Node')};

const options = ${JSON.stringify(options)};

const stringifiedAst = ${JSON.stringify(
				/* Double stringify to encode *as* stringified JSON */ JSON.stringify(ast),
			)};

export const getHeadings = createGetHeadings(stringifiedAst, markdocConfig, options);
export const Content = createContentComponent(
	Renderer,
	stringifiedAst,
	markdocConfig,
  options,
	tagComponentMap,
	nodeComponentMap,
)`;
			return { code: res };
		},
		contentModuleTypes: await fs.promises.readFile(
			new URL('../template/content-module-types.d.ts', import.meta.url),
			'utf-8',
		),
	};
}

/**
 * Recursively resolve partial tags to their content.
 * Note: Mutates the `ast` object directly.
 */
async function resolvePartials({
	ast,
	fileUrl,
	root,
	tokenizer,
	allowHTML,
	markdocConfig,
	pluginContext,
	raisePartialValidationErrors,
}: {
	ast: Node;
	fileUrl: URL;
	root: URL;
	tokenizer: any;
	allowHTML?: boolean;
	markdocConfig: MarkdocConfig;
	pluginContext: Rollup.PluginContext;
	raisePartialValidationErrors: (ast: Node, filePath: string) => void;
}) {
	const relativePartialPath = path.relative(fileURLToPath(root), fileURLToPath(fileUrl));
	for (const node of ast.walk()) {
		if (node.type === 'tag' && node.tag === 'partial') {
			const { file } = node.attributes;
			if (!file) {
				throw new MarkdocError({
					// Should be caught by Markdoc validation step.
					message: `(Uncaught error) Partial tag requires a 'file' attribute`,
				});
			}

			if (markdocConfig.partials?.[file]) continue;

			let partialPath: string;
			let partialContents: string;
			try {
				const resolved = await pluginContext.resolve(file, fileURLToPath(fileUrl));
				let partialId = resolved?.id;
				if (!partialId) {
					const attemptResolveAsRelative = await pluginContext.resolve(
						'./' + file,
						fileURLToPath(fileUrl),
					);
					if (!attemptResolveAsRelative?.id) throw new Error();
					partialId = attemptResolveAsRelative.id;
				}

				partialPath = fileURLToPath(new URL(prependForwardSlash(partialId), 'file://'));
				partialContents = await fs.promises.readFile(partialPath, 'utf-8');
			} catch {
				throw new MarkdocError({
					message: [
						`**${String(relativePartialPath)}** contains invalid content:`,
						`Could not read partial file \`${file}\`. Does the file exist?`,
					].join('\n'),
				});
			}
			if (pluginContext.meta.watchMode) pluginContext.addWatchFile(partialPath);
			let partialTokens = tokenizer.tokenize(partialContents);
			if (allowHTML) {
				partialTokens = htmlTokenTransform(tokenizer, partialTokens);
			}
			const partialAst = Markdoc.parse(partialTokens);
			raisePartialValidationErrors(partialAst, partialPath);
			await resolvePartials({
				ast: partialAst,
				root,
				fileUrl: pathToFileURL(partialPath),
				tokenizer,
				allowHTML,
				markdocConfig,
				pluginContext,
				raisePartialValidationErrors,
			});

			Object.assign(node, partialAst);
		}
	}
}

function raiseValidationErrors({
	ast,
	markdocConfig,
	viteId,
	astroConfig,
	filePath,
}: {
	ast: Node;
	markdocConfig: MarkdocConfig;
	viteId: string;
	astroConfig: AstroConfig;
	filePath: string;
}) {
	const validationErrors = Markdoc.validate(ast, markdocConfig).filter((e) => {
		return (
			(e.error.level === 'error' || e.error.level === 'critical') &&
			// Ignore `variable-undefined` errors.
			// Variables can be configured at runtime,
			// so we cannot validate them at build time.
			e.error.id !== 'variable-undefined' &&
			// Ignore missing partial errors.
			// We will resolve these in `resolvePartials`.
			!(e.error.id === 'attribute-value-invalid' && /^Partial .+ not found/.test(e.error.message))
		);
	});

	if (validationErrors.length) {
		const rootRelativePath = path.relative(fileURLToPath(astroConfig.root), filePath);
		throw new MarkdocError({
			message: [
				`**${String(rootRelativePath)}** contains invalid content:`,
				...validationErrors.map((e) => `- ${e.error.message}`),
			].join('\n'),
			location: {
				// Error overlay does not support multi-line or ranges.
				// Just point to the first line.
				line: validationErrors[0].lines[0],
				file: viteId,
			},
		});
	}
}

function getUsedTags(markdocAst: Node) {
	const tags = new Set<string>();
	const validationErrors = Markdoc.validate(markdocAst);
	// Hack: run the validator with an empty config and look for 'tag-undefined'.
	// This is our signal that a tag is being used!
	for (const { error } of validationErrors) {
		if (error.id === 'tag-undefined') {
			const [, tagName] = /Undefined tag: '(.*)'/.exec(error.message) ?? [];
			tags.add(tagName);
		}
	}
	return tags;
}

/**
 * Emits optimized images, and appends the generated `src` to each AST node
 * via the `__optimizedSrc` attribute.
 */
async function emitOptimizedImages(
	nodeChildren: Node[],
	ctx: {
		pluginContext: Rollup.PluginContext;
		filePath: string;
		astroConfig: AstroConfig;
	},
) {
	for (const node of nodeChildren) {
		let isComponent = node.type === 'tag' && node.tag === 'image';
		// Support either a ![]() or {% image %} syntax, and handle the `src` attribute accordingly.
		if ((node.type === 'image' || isComponent) && typeof node.attributes.src === 'string') {
			let attributeName = isComponent ? 'src' : '__optimizedSrc';

			// If the image isn't an URL or a link to public, try to resolve it.
			if (shouldOptimizeImage(node.attributes.src)) {
				// Attempt to resolve source with Vite.
				// This handles relative paths and configured aliases
				const resolved = await ctx.pluginContext.resolve(node.attributes.src, ctx.filePath);

				if (resolved?.id && fs.existsSync(new URL(prependForwardSlash(resolved.id), 'file://'))) {
					const src = await emitESMImage(
						resolved.id,
						ctx.pluginContext.meta.watchMode,
						!!ctx.astroConfig.experimental.svg,
						ctx.pluginContext.emitFile,
					);

					const fsPath = resolved.id;

					if (src) {
						// We cannot track images in Markdoc, Markdoc rendering always strips out the proxy. As such, we'll always
						// assume that the image is referenced elsewhere, to be on safer side.
						if (ctx.astroConfig.output === 'static') {
							if (globalThis.astroAsset.referencedImages)
								globalThis.astroAsset.referencedImages.add(fsPath);
						}

						node.attributes[attributeName] = { ...src, fsPath };
					}
				} else {
					throw new MarkdocError({
						message: `Could not resolve image ${JSON.stringify(
							node.attributes.src,
						)} from ${JSON.stringify(ctx.filePath)}. Does the file exist?`,
					});
				}
			} else if (isComponent) {
				// If the user is using the {% image %} tag, always pass the `src` attribute as `__optimizedSrc`, even if it's an external URL or absolute path.
				// That way, the component can decide whether to optimize it or not.
				node.attributes[attributeName] = node.attributes.src;
			}
		}
		await emitOptimizedImages(node.children, ctx);
	}
}

function shouldOptimizeImage(src: string) {
	// Optimize anything that is NOT external or an absolute path to `public/`
	return !isValidUrl(src) && !src.startsWith('/');
}

/**
 * Get stringified import statements for configured tags or nodes.
 * `componentNamePrefix` is appended to the import name for namespacing.
 *
 * Example output: `import Tagaside from '/Users/.../src/components/Aside.astro';`
 */
function getStringifiedImports(
	componentConfigMap: Record<string, ComponentConfig>,
	componentNamePrefix: string,
	root: URL,
) {
	let stringifiedComponentImports = '';
	for (const [key, config] of Object.entries(componentConfigMap)) {
		const importName = config.namedExport
			? `{ ${config.namedExport} as ${componentNamePrefix + toImportName(key)} }`
			: componentNamePrefix + toImportName(key);
		const resolvedPath =
			config.type === 'local' ? fileURLToPath(new URL(config.path, root)) : config.path;

		stringifiedComponentImports += `import ${importName} from ${JSON.stringify(resolvedPath)};\n`;
	}
	return stringifiedComponentImports;
}

function toImportName(unsafeName: string) {
	// TODO: more checks that name is a safe JS variable name
	return unsafeName.replace('-', '_');
}

/**
 * Get a stringified map from tag / node name to component import name.
 * This uses the same `componentNamePrefix` used by `getStringifiedImports()`.
 *
 * Example output: `{ aside: Tagaside, heading: Tagheading }`
 */
function getStringifiedMap(
	componentConfigMap: Record<string, ComponentConfig>,
	componentNamePrefix: string,
) {
	let stringifiedComponentMap = '{';
	for (const key in componentConfigMap) {
		stringifiedComponentMap += `${JSON.stringify(key)}: ${
			componentNamePrefix + toImportName(key)
		},\n`;
	}
	stringifiedComponentMap += '}';
	return stringifiedComponentMap;
}

/**
 * Match YAML exception handling from Astro core errors
 * @see 'astro/src/core/errors.ts'
 */
function safeParseFrontmatter(fileContents: string, filePath: string) {
	try {
		// empty with lines to preserve sourcemap location, but not `empty-with-spaces`
		// because markdoc struggles with spaces
		return parseFrontmatter(fileContents, { frontmatter: 'empty-with-lines' });
	} catch (e: any) {
		if (e.name === 'YAMLException') {
			const err: Error & ViteErrorPayload['err'] = e;
			err.id = filePath;
			err.loc = { file: e.id, line: e.mark.line + 1, column: e.mark.column };
			err.message = e.reason;
			throw err;
		} else {
			throw e;
		}
	}
}

import { compile as mdxCompile, nodeTypes } from '@mdx-js/mdx';
import mdxPlugin, { Options as MdxRollupPluginOptions } from '@mdx-js/rollup';
import type { AstroIntegration, AstroConfig } from 'astro';
import { remarkInitializeAstroData, rehypeApplyFrontmatterExport } from './astro-data-plugins.js';
import { parse as parseESM } from 'es-module-lexer';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import type { RemarkMdxFrontmatterOptions } from 'remark-mdx-frontmatter';
import remarkShikiTwoslash from 'remark-shiki-twoslash';
import remarkSmartypants from 'remark-smartypants';
import { VFile } from 'vfile';
import type { Plugin as VitePlugin } from 'vite';
import rehypeCollectHeadings from './rehype-collect-headings.js';
import remarkPrism from './remark-prism.js';
import { getFileInfo, parseFrontmatter } from './utils.js';

type WithExtends<T> = T | { extends: T };

type MdxOptions = {
	remarkPlugins?: WithExtends<MdxRollupPluginOptions['remarkPlugins']>;
	rehypePlugins?: WithExtends<MdxRollupPluginOptions['rehypePlugins']>;
	/**
	 * Configure the remark-mdx-frontmatter plugin
	 * @see https://github.com/remcohaszing/remark-mdx-frontmatter#options for a full list of options
	 * @default {{ name: 'frontmatter' }}
	 */
	frontmatterOptions?: RemarkMdxFrontmatterOptions;
};

const DEFAULT_REMARK_PLUGINS = [remarkGfm, remarkSmartypants];
const DEFAULT_REHYPE_PLUGINS = [rehypeCollectHeadings];

function handleExtends<T>(config: WithExtends<T[] | undefined>, defaults: T[] = []): T[] {
	if (Array.isArray(config)) return config;

	return [...defaults, ...(config?.extends ?? [])];
}

function getRemarkPlugins(
	mdxOptions: MdxOptions,
	config: AstroConfig
): MdxRollupPluginOptions['remarkPlugins'] {
	let remarkPlugins = [
		// Initialize vfile.data.astroExports before all plugins are run
		remarkInitializeAstroData,
		...handleExtends(mdxOptions.remarkPlugins, DEFAULT_REMARK_PLUGINS),
	];
	if (config.markdown.syntaxHighlight === 'shiki') {
		remarkPlugins.push([
			// Default export still requires ".default" chaining for some reason
			// Workarounds tried:
			// - "import * as remarkShikiTwoslash"
			// - "import { default as remarkShikiTwoslash }"
			(remarkShikiTwoslash as any).default,
			config.markdown.shikiConfig,
		]);
	}
	if (config.markdown.syntaxHighlight === 'prism') {
		remarkPlugins.push(remarkPrism);
	}
	return remarkPlugins;
}

function getRehypePlugins(
	mdxOptions: MdxOptions,
	config: AstroConfig
): MdxRollupPluginOptions['rehypePlugins'] {
	let rehypePlugins = handleExtends(mdxOptions.rehypePlugins, DEFAULT_REHYPE_PLUGINS);

	if (config.markdown.syntaxHighlight === 'shiki' || config.markdown.syntaxHighlight === 'prism') {
		rehypePlugins.push([rehypeRaw, { passThrough: nodeTypes }]);
	}

	return rehypePlugins;
}

export default function mdx(mdxOptions: MdxOptions = {}): AstroIntegration {
	return {
		name: '@astrojs/mdx',
		hooks: {
			'astro:config:setup': ({ updateConfig, config, addPageExtension, command }: any) => {
				addPageExtension('.mdx');

				const mdxPluginOpts: MdxRollupPluginOptions = {
					remarkPlugins: getRemarkPlugins(mdxOptions, config),
					rehypePlugins: getRehypePlugins(mdxOptions, config),
					jsx: true,
					jsxImportSource: 'astro',
					// Note: disable `.md` support
					format: 'mdx',
					mdExtensions: [],
				};

				updateConfig({
					vite: {
						plugins: [
							{
								enforce: 'pre',
								...mdxPlugin(mdxPluginOpts),
								// Override transform to alter code before MDX compilation
								// ex. inject layouts
								async transform(code, id) {
									if (!id.endsWith('mdx')) return;

									let { data: frontmatter, content: pageContent } = parseFrontmatter(code, id);
									if (frontmatter.layout) {
										const { layout, ...contentProp } = frontmatter;
										code += `\n\nexport default async function({ children }) {\nconst Layout = (await import(${JSON.stringify(
											frontmatter.layout
										)})).default;\nreturn <Layout content={${JSON.stringify(
											contentProp
										)}}>{children}</Layout> }`;
									}

									const compiled = await mdxCompile(new VFile({ value: pageContent, path: id }), {
										...mdxPluginOpts,
										rehypePlugins: [
											...(mdxPluginOpts.rehypePlugins ?? []),
											() =>
												rehypeApplyFrontmatterExport(
													frontmatter,
													mdxOptions.frontmatterOptions?.name
												),
										],
									});

									return {
										code: String(compiled.value),
										map: compiled.map,
									};
								},
							},
							{
								name: '@astrojs/mdx-postprocess',
								// These transforms must happen *after* JSX runtime transformations
								transform(code, id) {
									if (!id.endsWith('.mdx')) return;
									const [, moduleExports] = parseESM(code);

									const { fileUrl, fileId } = getFileInfo(id, config);
									if (!moduleExports.includes('url')) {
										code += `\nexport const url = ${JSON.stringify(fileUrl)};`;
									}
									if (!moduleExports.includes('file')) {
										code += `\nexport const file = ${JSON.stringify(fileId)};`;
									}

									if (command === 'dev') {
										// TODO: decline HMR updates until we have a stable approach
										code += `\nif (import.meta.hot) {
											import.meta.hot.decline();
										}`;
									}
									return code;
								},
							},
						] as VitePlugin[],
					},
				});
			},
		},
	};
}

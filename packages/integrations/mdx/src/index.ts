import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { markdownConfigDefaults } from '@astrojs/markdown-remark';
import type {
	AstroIntegration,
	AstroIntegrationLogger,
	ContainerRenderer,
	ContentEntryType,
	HookParameters,
} from 'astro';
import type { Options as RemarkRehypeOptions } from 'remark-rehype';
import type { PluggableList } from 'unified';
import type { OptimizeOptions } from './rehype-optimize-static.js';
import { ignoreStringPlugins, safeParseFrontmatter } from './utils.js';
import { vitePluginMdxPostprocess } from './vite-plugin-mdx-postprocess.js';
import { type VitePluginMdxOptions, vitePluginMdx } from './vite-plugin-mdx.js';

export type MdxOptions = Omit<typeof markdownConfigDefaults, 'remarkPlugins' | 'rehypePlugins'> & {
	extendMarkdownConfig: boolean;
	recmaPlugins: PluggableList;
	// Markdown allows strings as remark and rehype plugins.
	// This is not supported by the MDX compiler, so override types here.
	remarkPlugins: PluggableList;
	rehypePlugins: PluggableList;
	remarkRehype: RemarkRehypeOptions;
	optimize: boolean | OptimizeOptions;
};

type SetupHookParams = HookParameters<'astro:config:setup'> & {
	// `addPageExtension` and `contentEntryType` are not a public APIs
	// Add type defs here
	addPageExtension: (extension: string) => void;
	addContentEntryType: (contentEntryType: ContentEntryType) => void;
};

export function getContainerRenderer(): ContainerRenderer {
	return {
		name: 'astro:jsx',
		serverEntrypoint: '@astrojs/mdx/server.js',
	};
}

export default function mdx(partialMdxOptions: Partial<MdxOptions> = {}): AstroIntegration {
	// @ts-expect-error Temporarily assign an empty object here, which will be re-assigned by the
	// `astro:config:done` hook later. This is so that `vitePluginMdx` can get hold of a reference earlier.
	let vitePluginMdxOptions: VitePluginMdxOptions = {};

	return {
		name: '@astrojs/mdx',
		hooks: {
			'astro:config:setup': async (params) => {
				const { updateConfig, config, addPageExtension, addContentEntryType, addRenderer } =
					params as SetupHookParams;

				addRenderer({
					name: 'astro:jsx',
					serverEntrypoint: new URL('../dist/server.js', import.meta.url),
				});
				addPageExtension('.mdx');
				addContentEntryType({
					extensions: ['.mdx'],
					async getEntryInfo({ fileUrl, contents }: { fileUrl: URL; contents: string }) {
						const parsed = safeParseFrontmatter(contents, fileURLToPath(fileUrl));
						return {
							data: parsed.frontmatter,
							body: parsed.content.trim(),
							slug: parsed.frontmatter.slug,
							rawData: parsed.rawFrontmatter,
						};
					},
					contentModuleTypes: await fs.readFile(
						new URL('../template/content-module-types.d.ts', import.meta.url),
						'utf-8',
					),
					// MDX can import scripts and styles,
					// so wrap all MDX files with script / style propagation checks
					handlePropagation: true,
				});

				updateConfig({
					vite: {
						plugins: [vitePluginMdx(vitePluginMdxOptions), vitePluginMdxPostprocess(config)],
					},
				});
			},
			'astro:config:done': ({ config, logger }) => {
				// We resolve the final MDX options here so that other integrations have a chance to modify
				// `config.markdown` before we access it
				const extendMarkdownConfig =
					partialMdxOptions.extendMarkdownConfig ?? defaultMdxOptions.extendMarkdownConfig;

				const resolvedMdxOptions = applyDefaultOptions({
					options: partialMdxOptions,
					defaults: markdownConfigToMdxOptions(
						extendMarkdownConfig ? config.markdown : markdownConfigDefaults,
						logger,
					),
				});

				// Mutate `mdxOptions` so that `vitePluginMdx` can reference the actual options
				Object.assign(vitePluginMdxOptions, {
					mdxOptions: resolvedMdxOptions,
					srcDir: config.srcDir,
				});
				// @ts-expect-error After we assign, we don't need to reference `mdxOptions` in this context anymore.
				// Re-assign it so that the garbage can be collected later.
				vitePluginMdxOptions = {};
			},
		},
	};
}

const defaultMdxOptions = {
	extendMarkdownConfig: true,
	recmaPlugins: [],
	optimize: false,
} satisfies Partial<MdxOptions>;

function markdownConfigToMdxOptions(
	markdownConfig: typeof markdownConfigDefaults,
	logger: AstroIntegrationLogger,
): MdxOptions {
	return {
		...defaultMdxOptions,
		...markdownConfig,
		remarkPlugins: ignoreStringPlugins(markdownConfig.remarkPlugins, logger),
		rehypePlugins: ignoreStringPlugins(markdownConfig.rehypePlugins, logger),
		remarkRehype: (markdownConfig.remarkRehype as any) ?? {},
	};
}

function applyDefaultOptions({
	options,
	defaults,
}: {
	options: Partial<MdxOptions>;
	defaults: MdxOptions;
}): MdxOptions {
	return {
		syntaxHighlight: options.syntaxHighlight ?? defaults.syntaxHighlight,
		extendMarkdownConfig: options.extendMarkdownConfig ?? defaults.extendMarkdownConfig,
		recmaPlugins: options.recmaPlugins ?? defaults.recmaPlugins,
		remarkRehype: options.remarkRehype ?? defaults.remarkRehype,
		gfm: options.gfm ?? defaults.gfm,
		smartypants: options.smartypants ?? defaults.smartypants,
		remarkPlugins: options.remarkPlugins ?? defaults.remarkPlugins,
		rehypePlugins: options.rehypePlugins ?? defaults.rehypePlugins,
		shikiConfig: options.shikiConfig ?? defaults.shikiConfig,
		optimize: options.optimize ?? defaults.optimize,
	};
}

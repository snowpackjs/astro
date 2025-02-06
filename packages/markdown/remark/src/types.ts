import type * as hast from 'hast';
import type * as mdast from 'mdast';
import type { Options as RemarkRehypeOptions } from 'remark-rehype';
import type { BuiltinTheme } from 'shiki';
import type * as unified from 'unified';
import type { CreateShikiHighlighterOptions, ShikiHighlighterHighlightOptions } from './shiki.js';

export type { Node } from 'unist';

declare module 'vfile' {
	interface DataMap {
		astro: {
			headings?: MarkdownHeading[];
			imagePaths?: string[];
			frontmatter?: Record<string, any>;
		};
	}
}

export type RemarkPlugin<PluginParameters extends any[] = any[]> = unified.Plugin<
	PluginParameters,
	mdast.Root
>;

export type RemarkPlugins = (string | [string, any] | RemarkPlugin | [RemarkPlugin, any])[];

export type RehypePlugin<PluginParameters extends any[] = any[]> = unified.Plugin<
	PluginParameters,
	hast.Root
>;

export type RehypePlugins = (string | [string, any] | RehypePlugin | [RehypePlugin, any])[];

export type RemarkRehype = RemarkRehypeOptions;

export type ThemePresets = BuiltinTheme | 'css-variables';

export interface ShikiConfig
	extends Pick<CreateShikiHighlighterOptions, 'langs' | 'theme' | 'themes' | 'langAlias'>,
		Pick<ShikiHighlighterHighlightOptions, 'defaultColor' | 'wrap' | 'transformers'> {}

export interface AstroMarkdownOptions {
	syntaxHighlight?: 'shiki' | 'prism' | false;
	shikiConfig?: ShikiConfig;
	remarkPlugins?: RemarkPlugins;
	rehypePlugins?: RehypePlugins;
	remarkRehype?: RemarkRehype;
	gfm?: boolean;
	smartypants?: boolean;
}

export interface MarkdownProcessor {
	render: (
		content: string,
		opts?: MarkdownProcessorRenderOptions,
	) => Promise<MarkdownProcessorRenderResult>;
}

export interface MarkdownProcessorRenderOptions {
	/** @internal */
	fileURL?: URL;
	/** Used for frontmatter injection plugins */
	frontmatter?: Record<string, any>;
}

export interface MarkdownProcessorRenderResult {
	code: string;
	metadata: {
		headings: MarkdownHeading[];
		imagePaths: string[];
		frontmatter: Record<string, any>;
	};
}

export interface MarkdownHeading {
	depth: number;
	slug: string;
	text: string;
}

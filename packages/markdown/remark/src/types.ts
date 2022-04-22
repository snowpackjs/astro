import type * as unified from 'unified';
import type * as mdast from 'mdast';
import type * as hast from 'hast';
import type { ILanguageRegistration, IThemeRegistration, Theme } from 'shiki';

export type { Node } from 'unist';

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

export interface ShikiConfig {
	langs: ILanguageRegistration[];
	theme: Theme | IThemeRegistration;
	wrap: boolean | null;
}

export interface AstroMarkdownOptions {
	mode: 'md' | 'mdx';
	drafts: boolean;
	syntaxHighlight: 'shiki' | 'prism' | false;
	shikiConfig: ShikiConfig;
	remarkPlugins: RemarkPlugins;
	rehypePlugins: RehypePlugins;
  remarkRehype: any;
}

export interface MarkdownRenderingOptions extends AstroMarkdownOptions {
	/** @internal */
	$?: {
		scopedClassName: string | null;
	};
}

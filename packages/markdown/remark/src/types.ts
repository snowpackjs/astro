import type * as hast from 'hast';
import type * as mdast from 'mdast';
import type {
	all as Handlers,
	one as Handler,
	Options as RemarkRehypeOptions,
} from 'remark-rehype';
import type { ILanguageRegistration, IThemeRegistration, Theme } from 'shiki';
import type * as unified from 'unified';
import type { VFile } from 'vfile';

export type { Node } from 'unist';

export type MarkdownAstroData = {
	frontmatter: Record<string, any>;
};

export type RemarkPlugin<PluginParameters extends any[] = any[]> = unified.Plugin<
	PluginParameters,
	mdast.Root
>;

export type RemarkPlugins = (RemarkPlugin | string | [RemarkPlugin, any] | [string, any])[];

export type RehypePlugin<PluginParameters extends any[] = any[]> = unified.Plugin<
	PluginParameters,
	hast.Root
>;

export type RehypePlugins = (RehypePlugin | string | [RehypePlugin, any] | [string, any])[];

export type RemarkRehype = Omit<RemarkRehypeOptions, 'handlers' | 'unknownHandler'> & {
	handlers?: typeof Handlers;
	handler?: typeof Handler;
};

export interface ShikiConfig {
	langs?: ILanguageRegistration[];
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	theme?: IThemeRegistration | Theme;
	wrap?: boolean | null;
}

export interface AstroMarkdownOptions {
	drafts?: boolean;
	syntaxHighlight?: 'prism' | 'shiki' | false;
	shikiConfig?: ShikiConfig;
	remarkPlugins?: RemarkPlugins;
	rehypePlugins?: RehypePlugins;
	remarkRehype?: RemarkRehype;
	gfm?: boolean;
	smartypants?: boolean;
}

export interface ImageMetadata {
	src: string;
	width: number;
	height: number;
	type: string;
}

export interface MarkdownRenderingOptions extends AstroMarkdownOptions {
	/** @internal */
	fileURL?: URL;
	/** @internal */
	$?: {
		scopedClassName: string | null;
	};
	/** Used for frontmatter injection plugins */
	frontmatter?: Record<string, any>;
	experimentalAssets?: boolean;
}

export interface MarkdownHeading {
	depth: number;
	slug: string;
	text: string;
}

export interface MarkdownMetadata {
	headings: MarkdownHeading[];
	source: string;
	html: string;
}

export interface MarkdownVFile extends VFile {
	data: {
		__astroHeadings?: MarkdownHeading[];
		imagePaths?: Set<string>;
	};
}

export interface MarkdownRenderingResult {
	metadata: MarkdownMetadata;
	vfile: MarkdownVFile;
	code: string;
}

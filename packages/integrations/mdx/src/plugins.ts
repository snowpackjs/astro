import {
	rehypeHeadingIds,
	rehypePrism,
	rehypeShiki,
	remarkCollectImages,
} from '@astrojs/markdown-remark';
import { createProcessor, nodeTypes } from '@mdx-js/mdx';
import { rehypeAnalyzeAstroMetadata } from 'astro/jsx/rehype.js';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import { SourceMapGenerator } from 'source-map';
import type { PluggableList } from 'unified';
import type { MdxOptions } from './index.js';
import { rehypeApplyFrontmatterExport } from './rehype-apply-frontmatter-export.js';
import { rehypeInjectHeadingsExport } from './rehype-collect-headings.js';
import { rehypeImageToComponent } from './rehype-images-to-component.js';
import rehypeMetaString from './rehype-meta-string.js';
import { rehypeOptimizeStatic } from './rehype-optimize-static.js';

// Skip nonessential plugins during performance benchmark runs
const isPerformanceBenchmark = Boolean(process.env.ASTRO_PERFORMANCE_BENCHMARK);

interface MdxProcessorExtraOptions {
	sourcemap: boolean;
}

export function createMdxProcessor(mdxOptions: MdxOptions, extraOptions: MdxProcessorExtraOptions) {
	return createProcessor({
		remarkPlugins: getRemarkPlugins(mdxOptions),
		rehypePlugins: getRehypePlugins(mdxOptions),
		recmaPlugins: mdxOptions.recmaPlugins,
		remarkRehypeOptions: mdxOptions.remarkRehype,
		jsxImportSource: 'astro',
		// Note: disable `.md` (and other alternative extensions for markdown files like `.markdown`) support
		format: 'mdx',
		mdExtensions: [],
		elementAttributeNameCase: 'html',
		SourceMapGenerator: extraOptions.sourcemap ? SourceMapGenerator : undefined,
	});
}

function getRemarkPlugins(mdxOptions: MdxOptions): PluggableList {
	let remarkPlugins: PluggableList = [];

	if (!isPerformanceBenchmark) {
		if (mdxOptions.gfm) {
			remarkPlugins.push(remarkGfm);
		}
		if (mdxOptions.smartypants) {
			remarkPlugins.push(remarkSmartypants);
		}
	}

	remarkPlugins.push(...mdxOptions.remarkPlugins, remarkCollectImages);

	return remarkPlugins;
}

function getRehypePlugins(mdxOptions: MdxOptions): PluggableList {
	let rehypePlugins: PluggableList = [
		// ensure `data.meta` is preserved in `properties.metastring` for rehype syntax highlighters
		rehypeMetaString,
		// rehypeRaw allows custom syntax highlighters to work without added config
		[rehypeRaw, { passThrough: nodeTypes }],
	];

	if (!isPerformanceBenchmark) {
		// Apply syntax highlighters after user plugins to match `markdown/remark` behavior
		if (mdxOptions.syntaxHighlight === 'shiki') {
			rehypePlugins.push([rehypeShiki, mdxOptions.shikiConfig]);
		} else if (mdxOptions.syntaxHighlight === 'prism') {
			rehypePlugins.push(rehypePrism);
		}
	}

	rehypePlugins.push(...mdxOptions.rehypePlugins, rehypeImageToComponent);

	if (!isPerformanceBenchmark) {
		// getHeadings() is guaranteed by TS, so this must be included.
		// We run `rehypeHeadingIds` _last_ to respect any custom IDs set by user plugins.
		rehypePlugins.push(rehypeHeadingIds, rehypeInjectHeadingsExport);
	}

	rehypePlugins.push(
		// Render info from `vfile.data.astro.frontmatter` as JS
		rehypeApplyFrontmatterExport,
		// Analyze MDX nodes and attach to `vfile.data.__astroMetadata`
		rehypeAnalyzeAstroMetadata,
	);

	if (mdxOptions.optimize) {
		// Convert user `optimize` option to compatible `rehypeOptimizeStatic` option
		const options = mdxOptions.optimize === true ? undefined : mdxOptions.optimize;
		rehypePlugins.push([rehypeOptimizeStatic, options]);
	}

	return rehypePlugins;
}

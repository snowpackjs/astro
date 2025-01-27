import { fileURLToPath, pathToFileURL } from 'node:url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { safeParseFrontmatter } from '../content/utils.js';
import type { ContentEntryType } from '../types/public/content.js';

export const markdownContentEntryType: ContentEntryType = {
	extensions: ['.md'],
	async getEntryInfo({ contents, fileUrl }: { contents: string; fileUrl: URL }) {
		const parsed = safeParseFrontmatter(contents, fileURLToPath(fileUrl));
		return {
			data: parsed.frontmatter,
			body: parsed.content.trim(),
			slug: parsed.frontmatter.slug,
			rawData: parsed.rawFrontmatter,
		};
	},
	// We need to handle propagation for Markdown because they support layouts which will bring in styles.
	handlePropagation: true,

	async getRenderFunction(config) {
		const processor = await createMarkdownProcessor(config.markdown);
		return async function renderToString(entry) {
			// Process markdown even if it's empty as remark/rehype plugins may add content or frontmatter dynamically
			const result = await processor.render(entry.body ?? '', {
				frontmatter: entry.data,
				// @ts-expect-error Internal API
				fileURL: entry.filePath ? pathToFileURL(entry.filePath) : undefined,
			});
			return {
				html: result.code,
				metadata: result.metadata,
			};
		};
	},
};

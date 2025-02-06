import {
	type ShikiConfig,
	type ShikiHighlighter,
	createShikiHighlighter,
} from '@astrojs/markdown-remark';

// Caches Promise<ShikiHighlighter> for reuse when the same theme and langs are provided
const cachedHighlighters = new Map();

export function getCachedHighlighter(opts: ShikiConfig): Promise<ShikiHighlighter> {
	// Always sort keys before stringifying to make sure objects match regardless of parameter ordering
	const key = JSON.stringify(opts, Object.keys(opts).sort());

	// Highlighter has already been requested, reuse the same instance
	if (cachedHighlighters.has(key)) {
		return cachedHighlighters.get(key);
	}

	const highlighter = createShikiHighlighter(opts);
	cachedHighlighters.set(key, highlighter);

	return highlighter;
}

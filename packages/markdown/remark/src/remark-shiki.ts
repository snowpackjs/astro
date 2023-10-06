import { bundledLanguages, getHighlighter, type Highlighter } from 'shikiji';
import { visit } from 'unist-util-visit';
import type { RemarkPlugin, ShikiConfig } from './types.js';

/**
 * getHighlighter() is the most expensive step of Shiki. Instead of calling it on every page,
 * cache it here as much as possible. Make sure that your highlighters can be cached, state-free.
 * We make this async, so that multiple calls to parse markdown still share the same highlighter.
 */
const highlighterCacheAsync = new Map<string, Promise<Highlighter>>();

export function remarkShiki({
	langs = [],
	theme = 'github-dark',
	wrap = false,
}: ShikiConfig = {}): ReturnType<RemarkPlugin> {
	const cacheId =
		(typeof theme === 'string' ? theme : theme.name ?? '') +
		langs.map((l) => l.name ?? (l as any).id).join(',');

	let highlighterAsync = highlighterCacheAsync.get(cacheId);
	if (!highlighterAsync) {
		highlighterAsync = getHighlighter({
			langs: langs.length ? langs : Object.keys(bundledLanguages),
			themes: [theme],
		});
		highlighterCacheAsync.set(cacheId, highlighterAsync);
	}

	return async (tree: any) => {
		const highlighter = await highlighterAsync!;

		visit(tree, 'code', (node) => {
			let lang: string;

			if (typeof node.lang === 'string') {
				const langExists = highlighter.getLoadedLanguages().includes(node.lang);
				if (langExists) {
					lang = node.lang;
				} else {
					// eslint-disable-next-line no-console
					console.warn(`The language "${node.lang}" doesn't exist, falling back to plaintext.`);
					lang = 'plaintext';
				}
			} else {
				lang = 'plaintext';
			}

			let html = highlighter.codeToHtml(node.value, { lang, theme });

			// Q: Couldn't these regexes match on a user's inputted code blocks?
			// A: Nope! All rendered HTML is properly escaped.
			// Ex. If a user typed `<span class="line"` into a code block,
			// It would become this before hitting our regexes:
			// &lt;span class=&quot;line&quot;

			// Replace "shiki" class naming with "astro".
			html = html.replace(/<pre class="(.*?)shiki(.*?)"/, `<pre class="$1astro-code$2"`);
			// Add "user-select: none;" for "+"/"-" diff symbols
			if (node.lang === 'diff') {
				html = html.replace(
					/<span class="line"><span style="(.*?)">([\+|\-])/g,
					'<span class="line"><span style="$1"><span style="user-select: none;">$2</span>'
				);
			}
			// Handle code wrapping
			// if wrap=null, do nothing.
			if (wrap === false) {
				html = html.replace(/style="(.*?)"/, 'style="$1; overflow-x: auto;"');
			} else if (wrap === true) {
				html = html.replace(
					/style="(.*?)"/,
					'style="$1; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;"'
				);
			}

			node.type = 'html';
			node.value = html;
			node.children = [];
		});
	};
}

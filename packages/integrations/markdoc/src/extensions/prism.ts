import { runHighlighterWithAstro } from '@astrojs/prism/dist/highlighter';
import { unescapeHTML } from 'astro/runtime/server/index.js';
import { type AstroMarkdocConfig, Markdoc } from '../config.js';

export default function prism(): AstroMarkdocConfig {
	return {
		nodes: {
			fence: {
				attributes: Markdoc.nodes.fence.attributes!,
				transform({ attributes: { language, content } }) {
					const { html, classLanguage } = runHighlighterWithAstro(language, content);

					// Use `unescapeHTML` to return `HTMLString` for Astro renderer to inline as HTML
					return unescapeHTML(
						`<pre class="${classLanguage}"><code class="${classLanguage}">${html}</code></pre>`,
					) as any;
				},
			},
		},
	};
}

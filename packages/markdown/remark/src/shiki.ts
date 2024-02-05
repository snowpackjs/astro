import { bundledLanguages, createCssVariablesTheme, getHighlighter } from 'shikiji';
import { visit } from 'unist-util-visit';
import type { Properties } from 'hast';
import type { ShikiConfig } from './types.js';
import type { HTMLAttributes } from '../../../../packages/astro/types.js';

export interface ShikiHighlighter {
	highlight(code: string, lang?: string, options?: { inline?: boolean }, additionalProps?:HTMLAttributes<'pre'>): string;
}

// TODO: Remove this special replacement in Astro 5
const ASTRO_COLOR_REPLACEMENTS: Record<string, string> = {
	'--astro-code-foreground': '--astro-code-color-text',
	'--astro-code-background': '--astro-code-color-background',
};
const COLOR_REPLACEMENT_REGEX = new RegExp(
	`(${Object.keys(ASTRO_COLOR_REPLACEMENTS).join('|')})`,
	'g'
);

let _cssVariablesTheme: ReturnType<typeof createCssVariablesTheme>;
const cssVariablesTheme = () =>
	_cssVariablesTheme ??
	(_cssVariablesTheme = createCssVariablesTheme({ variablePrefix: '--astro-code-' }));

export async function createShikiHighlighter({
	langs = [],
	theme = 'github-dark',
	experimentalThemes = {},
	wrap = false,
	transformers = [],
}: ShikiConfig = {}): Promise<ShikiHighlighter> {
	const themes = experimentalThemes;

	theme = theme === 'css-variables' ? cssVariablesTheme() : theme;

	const highlighter = await getHighlighter({
		langs: langs.length ? langs : Object.keys(bundledLanguages),
		themes: Object.values(themes).length ? Object.values(themes) : [theme],
	});

	const loadedLanguages = highlighter.getLoadedLanguages();

	return {
		highlight(code, lang = 'plaintext', options, additionalProps?:HTMLAttributes<'pre'>) {
			if (lang !== 'plaintext' && !loadedLanguages.includes(lang)) {
				// eslint-disable-next-line no-console
				console.warn(`[Shiki] The language "${lang}" doesn't exist, falling back to "plaintext".`);
				lang = 'plaintext';
			}

			const themeOptions = Object.values(themes).length ? { themes } : { theme };
			const inline = options?.inline ?? false;

			return highlighter.codeToHtml(code, {
				...themeOptions,
				lang,
				transformers: [
					{
						pre(node) {
							if (additionalProps) {
								Object.entries(additionalProps).forEach(([key, value]) => {
									if (key === 'class') {
										node.properties[key] += ` ${value}`; // Append to class instead of replacing it
									} else {
										node.properties[key] = value as string;
									}
								});
							}
							// Swap to `code` tag if inline
							if (inline) {
								node.tagName = 'code';
							}

							const classValue = normalizePropAsString(node.properties.class) ?? '';
							const styleValue = normalizePropAsString(node.properties.style) ?? '';

							// Replace "shiki" class naming with "astro-code"
							node.properties.class = classValue.replace(/shiki/g, 'astro-code');

							// Handle code wrapping
							// if wrap=null, do nothing.
							if (wrap === false) {
								node.properties.style = styleValue + '; overflow-x: auto;';
							} else if (wrap === true) {
								node.properties.style =
									styleValue + '; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;';
							}
						},
						line(node) {
							// Add "user-select: none;" for "+"/"-" diff symbols.
							// Transform `<span class="line"><span style="...">+ something</span></span>
							// into      `<span class="line"><span style="..."><span style="user-select: none;">+</span> something</span></span>`
							if (lang === 'diff') {
								const innerSpanNode = node.children[0];
								const innerSpanTextNode =
									innerSpanNode?.type === 'element' && innerSpanNode.children?.[0];

								if (innerSpanTextNode && innerSpanTextNode.type === 'text') {
									const start = innerSpanTextNode.value[0];
									if (start === '+' || start === '-') {
										innerSpanTextNode.value = innerSpanTextNode.value.slice(1);
										innerSpanNode.children.unshift({
											type: 'element',
											tagName: 'span',
											properties: { style: 'user-select: none;' },
											children: [{ type: 'text', value: start }],
										});
									}
								}
							}
						},
						code(node) {
							if (inline) {
								return node.children[0] as typeof node;
							}
						},
						root(node) {
							if (Object.values(experimentalThemes).length) {
								return;
							}

							// theme.id for shiki -> shikiji compat
							const themeName = typeof theme === 'string' ? theme : theme.name;
							if (themeName === 'css-variables') {
								// Replace special color tokens to CSS variables
								visit(node as any, 'element', (child) => {
									if (child.properties?.style) {
										child.properties.style = replaceCssVariables(child.properties.style);
									}
								});
							}
						},
					},
					...transformers,
				],
			});
		},
	};
}

function normalizePropAsString(value: Properties[string]): string | null {
	return Array.isArray(value) ? value.join(' ') : (value as string | null);
}

/**
 * shiki -> shikiji compat as we need to manually replace it
 * @internal Exported for error overlay use only
 */
export function replaceCssVariables(str: string) {
	return str.replace(COLOR_REPLACEMENT_REGEX, (match) => ASTRO_COLOR_REPLACEMENTS[match] || match);
}

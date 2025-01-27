import type { Tokenizer } from '@markdoc/markdoc';
import { Parser } from 'htmlparser2';
// @ts-expect-error This type isn't exported
// biome-ignore lint/correctness/noUnusedImports: not correctly detected because type isn't exported
import type * as Token from 'markdown-it/lib/token';

export function htmlTokenTransform(tokenizer: Tokenizer, tokens: Token[]): Token[] {
	const output: Token[] = [];

	// hold a lazy buffer of text and process it only when necessary
	let textBuffer = '';

	let inCDATA = false;

	const appendText = (text: string) => {
		textBuffer += text;
	};

	// process the current text buffer w/ Markdoc's Tokenizer for tokens
	const processTextBuffer = () => {
		if (textBuffer.length > 0) {
			// tokenize the text buffer to look for structural markup tokens
			const toks = tokenizer.tokenize(textBuffer);

			// when we tokenize some raw text content, it's basically treated like Markdown, and will result in a paragraph wrapper, which we don't want
			// in this scenario, we just want to generate a text token, but, we have to tokenize it in case there's other structural markup
			if (toks.length === 3) {
				const first = toks[0];
				const second = toks[1];
				const third: Token | undefined = toks.at(2);

				if (
					first.type === 'paragraph_open' &&
					second.type === 'inline' &&
					third &&
					third.type === 'paragraph_close' &&
					Array.isArray(second.children)
				) {
					for (const tok of second.children as Token[]) {
						// if the given token is a 'text' token and its trimmed content is the same as the pre-tokenized text buffer, use the original
						// text buffer instead to preserve leading/trailing whitespace that is lost during tokenization of pure text content
						if (tok.type === 'text') {
							if (tok.content.trim() == textBuffer.trim()) {
								tok.content = textBuffer;
							}
						}
						output.push(tok);
					}
				} else {
					// some other markup that happened to be 3 tokens, push tokens as-is
					for (const tok of toks) {
						output.push(tok);
					}
				}
			} else {
				// some other tokenized markup, push tokens as-is
				for (const tok of toks) {
					output.push(tok);
				}
			}

			// reset the current lazy text buffer
			textBuffer = '';
		}
	};

	// create an incremental HTML parser that tracks HTML tag open, close and text content
	const parser = new Parser(
		{
			oncdatastart() {
				inCDATA = true;
			},

			oncdataend() {
				inCDATA = false;
			},

			// when an HTML tag opens...
			onopentag(name, attrs) {
				// process any buffered text to be treated as text node before the currently opening HTML tag
				processTextBuffer();

				// push an  'html-tag' 'tag_open' Markdoc node instance for the currently opening HTML tag onto the resulting Token stack
				output.push({
					type: 'tag_open',
					nesting: 1,
					meta: {
						tag: 'html-tag',
						attributes: [
							{ type: 'attribute', name: 'name', value: name },
							{ type: 'attribute', name: 'attrs', value: attrs },
						],
					},
				} as Token);
			},

			ontext(content: string | null | undefined) {
				if (inCDATA) {
					// ignore entirely while inside CDATA
					return;
				}

				// only accumulate text into the buffer if we're not under an ignored HTML element
				if (typeof content === 'string') {
					appendText(content);
				}
			},

			// when an HTML tag closes...
			onclosetag(name) {
				// process any buffered text to be treated as a text node inside the currently closing HTML tag
				processTextBuffer();

				// push an 'html-tag' 'tag_close' Markdoc node instance for the currently closing HTML tag onto the resulting Token stack
				output.push({
					type: 'tag_close',
					nesting: -1,
					meta: {
						tag: 'html-tag',
						attributes: [{ type: 'attribute', name: 'name', value: name }],
					},
				} as Token);
			},
		},
		{
			decodeEntities: false,
			recognizeCDATA: true,
			recognizeSelfClosing: true,
		},
	);

	// for every detected token...
	for (const token of tokens) {
		// if it was an HTML token, write the HTML text into the HTML parser
		if (token.type.startsWith('html')) {
			// as the parser encounters opening/closing HTML tags, it will push Markdoc Tag nodes into the output stack
			parser.write(token.content);

			// continue loop... IMPORTANT! we're throwing away the original 'html' tokens here (raw HTML strings), since the parser is inserting new ones based on the parsed HTML
			continue;
		}

		// process any child content for HTML
		if (token.type === 'inline') {
			if (token.children) {
				token.children = htmlTokenTransform(tokenizer, token.children);
			}
		}

		// not an HTML Token, preserve it at the current stack location
		output.push(token);
	}

	// process any remaining buffered text
	processTextBuffer();

	//
	// post-process the current levels output Token[] array to un-wind this pattern:
	//
	// [
	//   { type: tag_open, meta.tag: html-tag },
	//   { type: paragraph_open },
	//   { type: inline, children [...] },
	//   { type: paragraph_close },
	//   { type: tag_close, meta.tag: html-tag }
	// ]
	//
	// the paragraph_open, inline, paragraph_close triplet needs to be replaced by the children of the inline node
	//
	// this is extra, unwanted paragraph wrapping unfortunately introduced by markdown-it during processing w/ HTML enabled
	//

	mutateAndCollapseExtraParagraphsUnderHtml(output);

	return output;
}

function mutateAndCollapseExtraParagraphsUnderHtml(tokens: Token[]): void {
	let done = false;

	while (!done) {
		const idx = findExtraParagraphUnderHtml(tokens);
		if (typeof idx === 'number') {
			// mutate

			const actualChildTokens = tokens[idx + 2].children ?? [];

			tokens.splice(idx, 5, ...actualChildTokens);
		} else {
			done = true;
		}
	}
}

/**
 *
 * @param token
 * @returns
 */
function findExtraParagraphUnderHtml(tokens: Token[]): number | null {
	if (tokens.length < 5) {
		return null;
	}

	for (let i = 0; i < tokens.length; i++) {
		const last = i + 4;
		if (last > tokens.length - 1) {
			break; // early exit, no more possible 5-long slices to search
		}

		const slice = tokens.slice(i, last + 1);
		const isMatch = isExtraParagraphPatternMatch(slice);
		if (isMatch) {
			return i;
		}
	}

	return null;
}

function isExtraParagraphPatternMatch(slice: Token[]): boolean {
	const match =
		isHtmlTagOpen(slice[0]) &&
		isParagraphOpen(slice[1]) &&
		isInline(slice[2]) &&
		isParagraphClose(slice[3]) &&
		isHtmlTagClose(slice[4]);
	return match;
}

function isHtmlTagOpen(token: Token): boolean {
	return token.type === 'tag_open' && token.meta && token.meta.tag === 'html-tag';
}

function isHtmlTagClose(token: Token): boolean {
	return token.type === 'tag_close' && token.meta && token.meta.tag === 'html-tag';
}

function isParagraphOpen(token: Token): boolean {
	return token.type === 'paragraph_open';
}

function isParagraphClose(token: Token): boolean {
	return token.type === 'paragraph_close';
}

function isInline(token: Token): boolean {
	return token.type === 'inline';
}

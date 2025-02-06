export function addAstro(Prism: typeof import('prismjs')) {
	if (Prism.languages.astro) {
		return;
	}

	let scriptLang: string;
	if (Prism.languages.typescript) {
		scriptLang = 'typescript';
	} else {
		scriptLang = 'javascript';
		console.warn(
			'Prism TypeScript language not loaded, Astro scripts will be treated as JavaScript.',
		);
	}

	let script = Prism.util.clone(Prism.languages[scriptLang]);

	// eslint-disable-next-line regexp/no-useless-assertions
	let space = /(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)/.source;
	let braces = /(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})/.source;
	let spread = /(?:\{<S>*\.{3}(?:[^{}]|<BRACES>)*\})/.source;

	function re(source: string, flags?: string) {
		source = source
			.replace(/<S>/g, function () {
				return space;
			})
			.replace(/<BRACES>/g, function () {
				return braces;
			})
			.replace(/<SPREAD>/g, function () {
				return spread;
			});
		return RegExp(source, flags);
	}

	spread = re(spread).source;

	Prism.languages.astro = Prism.languages.extend('markup', script);

	(Prism.languages.astro as any).tag.pattern = re(
		/<\/?(?:[\w.:-]+(?:<S>+(?:[\w.:$-]+(?:=(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s{'"/>=]+|<BRACES>))?|<SPREAD>))*<S>*\/?)?>/
			.source,
	);

	(Prism.languages.astro as any).tag.inside['tag'].pattern = /^<\/?[^\s>/]*/;
	(Prism.languages.astro as any).tag.inside['attr-value'].pattern =
		/=(?!\{)(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s'">]+)/;
	(Prism.languages.astro as any).tag.inside['tag'].inside['class-name'] =
		/^[A-Z]\w*(?:\.[A-Z]\w*)*$/;
	(Prism.languages.astro as any).tag.inside['comment'] = script['comment'];

	Prism.languages.insertBefore(
		'inside',
		'attr-name',
		{
			spread: {
				pattern: re(/<SPREAD>/.source),
				inside: Prism.languages.astro,
			},
		},
		(Prism.languages.astro as any).tag,
	);

	Prism.languages.insertBefore(
		'inside',
		'special-attr',
		{
			script: {
				// Allow for two levels of nesting
				pattern: re(/=<BRACES>/.source),
				inside: {
					'script-punctuation': {
						pattern: /^=(?=\{)/,
						alias: 'punctuation',
					},
					rest: Prism.languages.astro,
				},
				alias: `language-${scriptLang}`,
			},
		},
		(Prism.languages.astro as any).tag,
	);

	// The following will handle plain text inside tags
	let stringifyToken = function (token: any) {
		if (!token) {
			return '';
		}
		if (typeof token === 'string') {
			return token;
		}
		if (typeof token.content === 'string') {
			return token.content;
		}
		return token.content.map(stringifyToken).join('');
	};

	let walkTokens = function (tokens: any) {
		let openedTags: any[] = [];
		for (let i = 0; i < tokens.length; i++) {
			let token = tokens[i];

			// This breaks styles, not sure why
			if (token.type === 'style') {
				return;
			}

			let notTagNorBrace = false;

			if (typeof token !== 'string') {
				if (token.type === 'tag' && token.content[0] && token.content[0].type === 'tag') {
					// We found a tag, now find its kind

					if (token.content[0].content[0].content === '</') {
						// Closing tag
						if (
							openedTags.length > 0 &&
							openedTags[openedTags.length - 1].tagName ===
								stringifyToken(token.content[0].content[1])
						) {
							// Pop matching opening tag
							openedTags.pop();
						}
					} else {
						if (token.content[token.content.length - 1].content === '/>') {
							// Autoclosed tag, ignore
						} else {
							// Opening tag
							openedTags.push({
								tagName: stringifyToken(token.content[0].content[1]),
								openedBraces: 0,
							});
						}
					}
				} else if (openedTags.length > 0 && token.type === 'punctuation' && token.content === '{') {
					// Here we might have entered a Astro context inside a tag
					openedTags[openedTags.length - 1].openedBraces++;
				} else if (
					openedTags.length > 0 &&
					openedTags[openedTags.length - 1].openedBraces > 0 &&
					token.type === 'punctuation' &&
					token.content === '}'
				) {
					// Here we might have left a Astro context inside a tag
					openedTags[openedTags.length - 1].openedBraces--;
				} else {
					notTagNorBrace = true;
				}
			}
			if (notTagNorBrace || typeof token === 'string') {
				if (openedTags.length > 0 && openedTags[openedTags.length - 1].openedBraces === 0) {
					// Here we are inside a tag, and not inside a Astro context.
					// That's plain text: drop any tokens matched.
					let plainText = stringifyToken(token);

					// And merge text with adjacent text
					if (
						i < tokens.length - 1 &&
						(typeof tokens[i + 1] === 'string' || tokens[i + 1].type === 'plain-text')
					) {
						plainText += stringifyToken(tokens[i + 1]);
						tokens.splice(i + 1, 1);
					}
					if (i > 0 && (typeof tokens[i - 1] === 'string' || tokens[i - 1].type === 'plain-text')) {
						plainText = stringifyToken(tokens[i - 1]) + plainText;
						tokens.splice(i - 1, 1);
						i--;
					}

					tokens[i] = new Prism.Token('plain-text', plainText, undefined, plainText);
				}
			}

			if (token.content && typeof token.content !== 'string') {
				walkTokens(token.content);
			}
		}
	};

	Prism.hooks.add('after-tokenize', function (env: any) {
		if (env.language !== 'astro') {
			return;
		}
		walkTokens(env.tokens);
	});
}

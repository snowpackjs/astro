import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';
import { addAstro } from './plugin.js';

const languageMap = new Map([['ts', 'typescript']]);

export function runHighlighterWithAstro(lang: string | undefined, code: string) {
	if (!lang) {
		lang = 'plaintext';
	}
	let classLanguage = `language-${lang}`;
	const ensureLoaded = (language: string) => {
		if (language && !Prism.languages[language]) {
			loadLanguages([language]);
		}
	};

	if (languageMap.has(lang)) {
		ensureLoaded(languageMap.get(lang)!);
	} else if (lang === 'astro') {
		ensureLoaded('typescript');
		addAstro(Prism);
	} else {
		ensureLoaded('markup-templating'); // Prism expects this to exist for a number of other langs
		ensureLoaded(lang);
	}

	if (lang && !Prism.languages[lang]) {
		console.warn(`Unable to load the language: ${lang}`);
	}

	const grammar = Prism.languages[lang];
	let html = code;
	if (grammar) {
		html = Prism.highlight(code, grammar, lang);
	}

	return { classLanguage, html };
}

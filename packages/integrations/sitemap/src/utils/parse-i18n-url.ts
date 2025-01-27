interface ParsedI18nUrl {
	locale: string;
	path: string;
}

// NOTE: The parameters have been schema-validated with Zod
export function parseI18nUrl(
	url: string,
	defaultLocale: string,
	locales: Record<string, string>,
	base: string,
): ParsedI18nUrl | undefined {
	if (!url.startsWith(base)) {
		return undefined;
	}

	let s = url.slice(base.length);

	// Handle root URL
	if (!s || s === '/') {
		return { locale: defaultLocale, path: '/' };
	}

	if (s[0] !== '/') {
		s = '/' + s;
	}

	// Get locale from path, e.g.
	// "/en-US/" -> "en-US"
	// "/en-US/foo" -> "en-US"
	const locale = s.split('/')[1];
	if (locale in locales) {
		// "/en-US/foo" -> "/foo"
		let path = s.slice(1 + locale.length);
		if (!path) {
			path = '/';
		}
		return { locale, path };
	}

	return { locale: defaultLocale, path: s };
}

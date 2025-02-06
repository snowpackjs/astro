export interface AstroQuery {
	astro?: boolean;
	src?: boolean;
	type?: 'script' | 'template' | 'style' | 'custom';
	index?: number;
	lang?: string;
	raw?: boolean;
}

export interface ParsedRequestResult {
	filename: string;
	query: AstroQuery;
}

// Parses an id to check if it's an Astro request.
// CSS is imported like `import '/src/pages/index.astro?astro&type=style&index=0&lang.css';
// This parses those ids and returns an object representing what it found.
export function parseAstroRequest(id: string): ParsedRequestResult {
	const [filename, rawQuery] = id.split(`?`, 2);
	const query = Object.fromEntries(new URLSearchParams(rawQuery).entries()) as AstroQuery;
	if (query.astro != null) {
		query.astro = true;
	}
	if (query.src != null) {
		query.src = true;
	}
	if (query.index != null) {
		query.index = Number(query.index);
	}
	if (query.raw != null) {
		query.raw = true;
	}
	return {
		filename,
		query,
	};
}

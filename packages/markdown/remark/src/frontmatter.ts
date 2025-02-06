import yaml from 'js-yaml';
import * as toml from 'smol-toml';

export function isFrontmatterValid(frontmatter: Record<string, any>) {
	try {
		// ensure frontmatter is JSON-serializable
		JSON.stringify(frontmatter);
	} catch {
		return false;
	}
	return typeof frontmatter === 'object' && frontmatter !== null;
}

// Capture frontmatter wrapped with `---` or `+++`, including any characters and new lines within it.
// Only capture if `---` or `+++` exists near the top of the file, including:
// 1. Start of file (including if has BOM encoding)
// 2. Start of file with any whitespace (but `---` or `+++` must still start on a new line)
const frontmatterRE = /(?:^\uFEFF?|^\s*\n)(?:---|\+\+\+)([\s\S]*?\n)(?:---|\+\+\+)/;
const frontmatterTypeRE = /(?:^\uFEFF?|^\s*\n)(---|\+\+\+)/;
export function extractFrontmatter(code: string): string | undefined {
	return frontmatterRE.exec(code)?.[1];
}

function getFrontmatterParser(code: string): [string, (str: string) => unknown] {
	return frontmatterTypeRE.exec(code)?.[1] === '+++' ? ['+++', toml.parse] : ['---', yaml.load];
}
export interface ParseFrontmatterOptions {
	/**
	 * How the frontmatter should be handled in the returned `content` string.
	 * - `preserve`: Keep the frontmatter.
	 * - `remove`: Remove the frontmatter.
	 * - `empty-with-spaces`: Replace the frontmatter with empty spaces. (preserves sourcemap line/col/offset)
	 * - `empty-with-lines`: Replace the frontmatter with empty line breaks. (preserves sourcemap line/col)
	 *
	 * @default 'remove'
	 */
	frontmatter: 'preserve' | 'remove' | 'empty-with-spaces' | 'empty-with-lines';
}

export interface ParseFrontmatterResult {
	frontmatter: Record<string, any>;
	rawFrontmatter: string;
	content: string;
}

export function parseFrontmatter(
	code: string,
	options?: ParseFrontmatterOptions,
): ParseFrontmatterResult {
	const rawFrontmatter = extractFrontmatter(code);

	if (rawFrontmatter == null) {
		return { frontmatter: {}, rawFrontmatter: '', content: code };
	}
	const [delims, parser] = getFrontmatterParser(code);
	const parsed = parser(rawFrontmatter);
	const frontmatter = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, any>;

	let content: string;
	switch (options?.frontmatter ?? 'remove') {
		case 'preserve':
			content = code;
			break;
		case 'remove':
			content = code.replace(`${delims}${rawFrontmatter}${delims}`, '');
			break;
		case 'empty-with-spaces':
			content = code.replace(
				`${delims}${rawFrontmatter}${delims}`,
				`   ${rawFrontmatter.replace(/[^\r\n]/g, ' ')}   `,
			);
			break;
		case 'empty-with-lines':
			content = code.replace(
				`${delims}${rawFrontmatter}${delims}`,
				rawFrontmatter.replace(/[^\r\n]/g, ''),
			);
			break;
	}

	return {
		frontmatter,
		rawFrontmatter,
		content,
	};
}

import type { AstroConfig } from 'astro';
import { type ExportSpecifier, type ImportSpecifier, parse } from 'es-module-lexer';
import type { Plugin } from 'vite';
import {
	ASTRO_IMAGE_ELEMENT,
	ASTRO_IMAGE_IMPORT,
	USES_ASTRO_IMAGE_FLAG,
} from './rehype-images-to-component.js';
import { type FileInfo, getFileInfo } from './utils.js';

const underscoreFragmentImportRegex = /[\s,{]_Fragment[\s,}]/;
const astroTagComponentImportRegex = /[\s,{]__astro_tag_component__[\s,}]/;

// These transforms must happen *after* JSX runtime transformations
export function vitePluginMdxPostprocess(astroConfig: AstroConfig): Plugin {
	return {
		name: '@astrojs/mdx-postprocess',
		transform(code, id, opts) {
			if (!id.endsWith('.mdx')) return;

			const fileInfo = getFileInfo(id, astroConfig);
			const [imports, exports] = parse(code);

			// Call a series of functions that transform the code
			code = injectUnderscoreFragmentImport(code, imports);
			code = injectMetadataExports(code, exports, fileInfo);
			code = transformContentExport(code, exports);
			code = annotateContentExport(code, id, !!opts?.ssr, imports);

			// The code transformations above are append-only, so the line/column mappings are the same
			// and we can omit the sourcemap for performance.
			return { code, map: null };
		},
	};
}

/**
 * Inject `Fragment` identifier import if not already present.
 */
function injectUnderscoreFragmentImport(code: string, imports: readonly ImportSpecifier[]) {
	if (!isSpecifierImported(code, imports, underscoreFragmentImportRegex, 'astro/jsx-runtime')) {
		code += `\nimport { Fragment as _Fragment } from 'astro/jsx-runtime';`;
	}
	return code;
}

/**
 * Inject MDX metadata as exports of the module.
 */
function injectMetadataExports(
	code: string,
	exports: readonly ExportSpecifier[],
	fileInfo: FileInfo,
) {
	if (!exports.some(({ n }) => n === 'url')) {
		code += `\nexport const url = ${JSON.stringify(fileInfo.fileUrl)};`;
	}
	if (!exports.some(({ n }) => n === 'file')) {
		code += `\nexport const file = ${JSON.stringify(fileInfo.fileId)};`;
	}
	return code;
}

/**
 * Transforms the `MDXContent` default export as `Content`, which wraps `MDXContent` and
 * passes additional `components` props.
 */
function transformContentExport(code: string, exports: readonly ExportSpecifier[]) {
	if (exports.find(({ n }) => n === 'Content')) return code;

	// If have `export const components`, pass that as props to `Content` as fallback
	const hasComponents = exports.find(({ n }) => n === 'components');
	const usesAstroImage = exports.find(({ n }) => n === USES_ASTRO_IMAGE_FLAG);

	// Generate code for the `components` prop passed to `MDXContent`
	let componentsCode = `{ Fragment: _Fragment${
		hasComponents ? ', ...components' : ''
	}, ...props.components,`;
	if (usesAstroImage) {
		componentsCode += ` ${JSON.stringify(ASTRO_IMAGE_ELEMENT)}: ${
			hasComponents ? 'components.img ?? ' : ''
		} props.components?.img ?? ${ASTRO_IMAGE_IMPORT}`;
	}
	componentsCode += ' }';

	// Make `Content` the default export so we can wrap `MDXContent` and pass in `Fragment`
	code = code.replace('export default function MDXContent', 'function MDXContent');
	code += `
export const Content = (props = {}) => MDXContent({
  ...props,
  components: ${componentsCode},
});
export default Content;`;
	return code;
}

/**
 * Add properties to the `Content` export.
 */
function annotateContentExport(
	code: string,
	id: string,
	ssr: boolean,
	imports: readonly ImportSpecifier[],
) {
	// Mark `Content` as MDX component
	code += `\nContent[Symbol.for('mdx-component')] = true`;
	// Ensure styles and scripts are injected into a `<head>` when a layout is not applied
	code += `\nContent[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);`;
	// Assign the `moduleId` metadata to `Content`
	code += `\nContent.moduleId = ${JSON.stringify(id)};`;

	// Tag the `Content` export as "astro:jsx" so it's quicker to identify how to render this component
	if (ssr) {
		if (
			!isSpecifierImported(
				code,
				imports,
				astroTagComponentImportRegex,
				'astro/runtime/server/index.js',
			)
		) {
			code += `\nimport { __astro_tag_component__ } from 'astro/runtime/server/index.js';`;
		}
		code += `\n__astro_tag_component__(Content, 'astro:jsx');`;
	}

	return code;
}

/**
 * Check whether the `specifierRegex` matches for an import of `source` in the `code`.
 */
function isSpecifierImported(
	code: string,
	imports: readonly ImportSpecifier[],
	specifierRegex: RegExp,
	source: string,
) {
	for (const imp of imports) {
		if (imp.n !== source) continue;

		const importStatement = code.slice(imp.ss, imp.se);
		if (specifierRegex.test(importStatement)) return true;
	}

	return false;
}

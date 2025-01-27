import type { RehypePlugin } from '@astrojs/markdown-remark';
import type { RootContent } from 'hast';
import type {
	MdxJsxAttribute,
	MdxJsxFlowElementHast,
	MdxJsxTextElementHast,
} from 'mdast-util-mdx-jsx';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';
import { AstroError } from '../core/errors/errors.js';
import { AstroErrorData } from '../core/errors/index.js';
import { resolvePath } from '../core/viteUtils.js';
import type { PluginMetadata } from '../vite-plugin-astro/types.js';

// This import includes ambient types for hast to include mdx nodes
import type {} from 'mdast-util-mdx';
import { createDefaultAstroMetadata } from '../vite-plugin-astro/metadata.js';

const ClientOnlyPlaceholder = 'astro-client-only';

export const rehypeAnalyzeAstroMetadata: RehypePlugin = () => {
	return (tree, file) => {
		// Initial metadata for this MDX file, it will be mutated as we traverse the tree
		const metadata = createDefaultAstroMetadata();

		// Parse imports in this file. This is used to match components with their import source
		const imports = parseImports(tree.children);

		visit(tree, (node) => {
			if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return;

			const tagName = node.name;
			if (!tagName || !isComponent(tagName) || !hasClientDirective(node)) return;

			// From this point onwards, `node` is confirmed to be an island component

			// Match this component with its import source
			const matchedImport = findMatchingImport(tagName, imports);
			if (!matchedImport) {
				throw new AstroError({
					...AstroErrorData.NoMatchingImport,
					message: AstroErrorData.NoMatchingImport.message(node.name!),
				});
			}

			// If this is an Astro component, that means the `client:` directive is misused as it doesn't
			// work on Astro components as it's server-side only. Warn the user about this.
			if (matchedImport.path.endsWith('.astro')) {
				const clientAttribute = node.attributes.find(
					(attr) => attr.type === 'mdxJsxAttribute' && attr.name.startsWith('client:'),
				) as MdxJsxAttribute | undefined;
				if (clientAttribute) {
					console.warn(
						`You are attempting to render <${node.name!} ${
							clientAttribute.name
						} />, but ${node.name!} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`,
					);
				}
			}

			const resolvedPath = resolvePath(matchedImport.path, file.path);

			if (hasClientOnlyDirective(node)) {
				// Add this component to the metadata
				metadata.clientOnlyComponents.push({
					exportName: matchedImport.name,
					localName: '',
					specifier: tagName,
					resolvedPath,
				});
				// Mutate node with additional island attributes
				addClientOnlyMetadata(node, matchedImport, resolvedPath);
			} else {
				// Add this component to the metadata
				metadata.hydratedComponents.push({
					exportName: '*',
					localName: '',
					specifier: tagName,
					resolvedPath,
				});
				// Mutate node with additional island attributes
				addClientMetadata(node, matchedImport, resolvedPath);
			}
		});

		// Attach final metadata here, which can later be retrieved by `getAstroMetadata`
		file.data.__astroMetadata = metadata;
	};
};

export function getAstroMetadata(file: VFile) {
	return file.data.__astroMetadata as PluginMetadata['astro'] | undefined;
}

type ImportSpecifier = { local: string; imported: string };

/**
 * ```
 * import Foo from './Foo.jsx'
 * import { Bar } from './Bar.jsx'
 * import { Baz as Wiz } from './Bar.jsx'
 * import * as Waz from './BaWazz.jsx'
 *
 * // => Map {
 * //   "./Foo.jsx" => Set { { local: "Foo", imported: "default" } },
 * //   "./Bar.jsx" => Set {
 * //     { local: "Bar", imported: "Bar" }
 * //     { local: "Wiz", imported: "Baz" },
 * //   },
 * //   "./Waz.jsx" => Set { { local: "Waz", imported: "*" } },
 * // }
 * ```
 */
function parseImports(children: RootContent[]) {
	// Map of import source to its imported specifiers
	const imports = new Map<string, Set<ImportSpecifier>>();

	for (const child of children) {
		if (child.type !== 'mdxjsEsm') continue;

		const body = child.data?.estree?.body;
		if (!body) continue;

		for (const ast of body) {
			if (ast.type !== 'ImportDeclaration') continue;

			const source = ast.source.value as string;
			const specs: ImportSpecifier[] = ast.specifiers.map((spec) => {
				switch (spec.type) {
					case 'ImportDefaultSpecifier':
						return { local: spec.local.name, imported: 'default' };
					case 'ImportNamespaceSpecifier':
						return { local: spec.local.name, imported: '*' };
					case 'ImportSpecifier': {
						return {
							local: spec.local.name,
							imported:
								spec.imported.type === 'Identifier'
									? spec.imported.name
									: String(spec.imported.value),
						};
					}
					default:
						throw new Error('Unknown import declaration specifier: ' + spec);
				}
			});

			// Get specifiers set from source or initialize a new one
			let specSet = imports.get(source);
			if (!specSet) {
				specSet = new Set();
				imports.set(source, specSet);
			}

			for (const spec of specs) {
				specSet.add(spec);
			}
		}
	}

	return imports;
}

function isComponent(tagName: string) {
	return (
		(tagName[0] && tagName[0].toLowerCase() !== tagName[0]) ||
		tagName.includes('.') ||
		/[^a-zA-Z]/.test(tagName[0])
	);
}

function hasClientDirective(node: MdxJsxFlowElementHast | MdxJsxTextElementHast) {
	return node.attributes.some(
		(attr) => attr.type === 'mdxJsxAttribute' && attr.name.startsWith('client:'),
	);
}

function hasClientOnlyDirective(node: MdxJsxFlowElementHast | MdxJsxTextElementHast) {
	return node.attributes.some(
		(attr) => attr.type === 'mdxJsxAttribute' && attr.name === 'client:only',
	);
}

type MatchedImport = { name: string; path: string };

/**
 * ```
 * import Button from './Button.jsx'
 * <Button />
 * // => { name: "default", path: "./Button.jsx" }
 *
 * import { Button } from './Button.jsx'
 * <Button />
 * // => { name: "Button", path: "./Button.jsx" }
 *
 * import * as buttons from './Button.jsx'
 * <buttons.Foo.Bar />
 * // => { name: "Foo.Bar", path: "./Button.jsx" }
 *
 * import { buttons } from './Button.jsx'
 * <buttons.Foo.Bar />
 * // => { name: "buttons.Foo.Bar", path: "./Button.jsx" }
 *
 * import buttons from './Button.jsx'
 * <buttons.Foo.Bar />
 * // => { name: "default.Foo.Bar", path: "./Button.jsx" }
 * ```
 */
function findMatchingImport(
	tagName: string,
	imports: Map<string, Set<ImportSpecifier>>,
): MatchedImport | undefined {
	const tagSpecifier = tagName.split('.')[0];
	for (const [source, specs] of imports) {
		for (const { imported, local } of specs) {
			if (local === tagSpecifier) {
				// If tagName access properties, we need to make sure the returned `name`
				// properly access the properties from `path`
				if (tagSpecifier !== tagName) {
					switch (imported) {
						// Namespace import: "<buttons.Foo.Bar />" => name: "Foo.Bar"
						case '*': {
							const accessPath = tagName.slice(tagSpecifier.length + 1);
							return { name: accessPath, path: source };
						}
						// Default import: "<buttons.Foo.Bar />" => name: "default.Foo.Bar"
						case 'default': {
							// "buttons.Foo.Bar" => "Foo.Bar"
							const accessPath = tagName.slice(tagSpecifier.length + 1);
							return { name: `default.${accessPath}`, path: source };
						}
						// Named import: "<buttons.Foo.Bar />" => name: "buttons.Foo.Bar"
						default: {
							return { name: tagName, path: source };
						}
					}
				}

				return { name: imported, path: source };
			}
		}
	}
}

function addClientMetadata(
	node: MdxJsxFlowElementHast | MdxJsxTextElementHast,
	meta: MatchedImport,
	resolvedPath: string,
) {
	const attributeNames = node.attributes
		.map((attr) => (attr.type === 'mdxJsxAttribute' ? attr.name : null))
		.filter(Boolean);

	if (!attributeNames.includes('client:component-path')) {
		node.attributes.push({
			type: 'mdxJsxAttribute',
			name: 'client:component-path',
			value: resolvedPath,
		});
	}
	if (!attributeNames.includes('client:component-export')) {
		if (meta.name === '*') {
			meta.name = node.name!.split('.').slice(1).join('.')!;
		}
		node.attributes.push({
			type: 'mdxJsxAttribute',
			name: 'client:component-export',
			value: meta.name,
		});
	}
	if (!attributeNames.includes('client:component-hydration')) {
		node.attributes.push({
			type: 'mdxJsxAttribute',
			name: 'client:component-hydration',
			value: null,
		});
	}
}

function addClientOnlyMetadata(
	node: MdxJsxFlowElementHast | MdxJsxTextElementHast,
	meta: { path: string; name: string },
	resolvedPath: string,
) {
	const attributeNames = node.attributes
		.map((attr) => (attr.type === 'mdxJsxAttribute' ? attr.name : null))
		.filter(Boolean);

	if (!attributeNames.includes('client:display-name')) {
		node.attributes.push({
			type: 'mdxJsxAttribute',
			name: 'client:display-name',
			value: node.name,
		});
	}
	if (!attributeNames.includes('client:component-hydpathation')) {
		node.attributes.push({
			type: 'mdxJsxAttribute',
			name: 'client:component-path',
			value: resolvedPath,
		});
	}
	if (!attributeNames.includes('client:component-export')) {
		if (meta.name === '*') {
			meta.name = node.name!.split('.').slice(1).join('.')!;
		}
		node.attributes.push({
			type: 'mdxJsxAttribute',
			name: 'client:component-export',
			value: meta.name,
		});
	}
	if (!attributeNames.includes('client:component-hydration')) {
		node.attributes.push({
			type: 'mdxJsxAttribute',
			name: 'client:component-hydration',
			value: null,
		});
	}

	node.name = ClientOnlyPlaceholder;
}

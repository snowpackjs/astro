import { parseFrontmatter } from '@astrojs/markdown-remark';
import type { Options as AcornOpts } from 'acorn';
import { parse } from 'acorn';
import type { AstroConfig, AstroIntegrationLogger, SSRError } from 'astro';
import { bold } from 'kleur/colors';
import type { MdxjsEsm } from 'mdast-util-mdx';
import type { PluggableList } from 'unified';

function appendForwardSlash(path: string) {
	return path.endsWith('/') ? path : path + '/';
}

export interface FileInfo {
	fileId: string;
	fileUrl: string;
}

/** @see 'vite-plugin-utils' for source */
export function getFileInfo(id: string, config: AstroConfig): FileInfo {
	const sitePathname = appendForwardSlash(
		config.site ? new URL(config.base, config.site).pathname : config.base,
	);

	// Try to grab the file's actual URL
	let url: URL | undefined = undefined;
	try {
		url = new URL(`file://${id}`);
	} catch {}

	const fileId = id.split('?')[0];
	let fileUrl: string;
	const isPage = fileId.includes('/pages/');
	if (isPage) {
		fileUrl = fileId.replace(/^.*?\/pages\//, sitePathname).replace(/(?:\/index)?\.mdx$/, '');
	} else if (url?.pathname.startsWith(config.root.pathname)) {
		fileUrl = url.pathname.slice(config.root.pathname.length);
	} else {
		fileUrl = fileId;
	}

	if (fileUrl && config.trailingSlash === 'always') {
		fileUrl = appendForwardSlash(fileUrl);
	}
	return { fileId, fileUrl };
}

/**
 * Match YAML exception handling from Astro core errors
 * @see 'astro/src/core/errors.ts'
 */
export function safeParseFrontmatter(code: string, id: string) {
	try {
		return parseFrontmatter(code, { frontmatter: 'empty-with-spaces' });
	} catch (e: any) {
		if (e.name === 'YAMLException') {
			const err: SSRError = e;
			err.id = id;
			err.loc = { file: e.id, line: e.mark.line + 1, column: e.mark.column };
			err.message = e.reason;
			throw err;
		} else {
			throw e;
		}
	}
}

export function jsToTreeNode(
	jsString: string,
	acornOpts: AcornOpts = {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
): MdxjsEsm {
	return {
		type: 'mdxjsEsm',
		value: '',
		data: {
			// @ts-expect-error `parse` return types is incompatible but it should work in runtime
			estree: {
				...parse(jsString, acornOpts),
				type: 'Program',
				sourceType: 'module',
			},
		},
	};
}

export function ignoreStringPlugins(plugins: any[], logger: AstroIntegrationLogger): PluggableList {
	let validPlugins: PluggableList = [];
	let hasInvalidPlugin = false;
	for (const plugin of plugins) {
		if (typeof plugin === 'string') {
			logger.warn(`${bold(plugin)} not applied.`);
			hasInvalidPlugin = true;
		} else if (Array.isArray(plugin) && typeof plugin[0] === 'string') {
			logger.warn(`${bold(plugin[0])} not applied.`);
			hasInvalidPlugin = true;
		} else {
			validPlugins.push(plugin);
		}
	}
	if (hasInvalidPlugin) {
		logger.warn(
			`To inherit Markdown plugins in MDX, please use explicit imports in your config instead of "strings." See Markdown docs: https://docs.astro.build/en/guides/markdown-content/#markdown-plugins`,
		);
	}
	return validPlugins;
}

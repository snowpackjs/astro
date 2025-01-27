import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { AstroConfig } from 'astro';
import { build as esbuild } from 'esbuild';
import type { AstroMarkdocConfig } from './config.js';
import { MarkdocError } from './utils.js';

export const SUPPORTED_MARKDOC_CONFIG_FILES = [
	'markdoc.config.js',
	'markdoc.config.mjs',
	'markdoc.config.mts',
	'markdoc.config.ts',
];

export type MarkdocConfigResult = {
	config: AstroMarkdocConfig;
	fileUrl: URL;
};

export async function loadMarkdocConfig(
	astroConfig: Pick<AstroConfig, 'root'>,
): Promise<MarkdocConfigResult | undefined> {
	let markdocConfigUrl: URL | undefined;
	for (const filename of SUPPORTED_MARKDOC_CONFIG_FILES) {
		const filePath = new URL(filename, astroConfig.root);
		if (!fs.existsSync(filePath)) continue;

		markdocConfigUrl = filePath;
		break;
	}
	if (!markdocConfigUrl) return;

	const { code } = await bundleConfigFile({
		markdocConfigUrl,
		astroConfig,
	});
	const config: AstroMarkdocConfig = await loadConfigFromBundledFile(astroConfig.root, code);

	return {
		config,
		fileUrl: markdocConfigUrl,
	};
}

/**
 * Bundle config file to support `.ts` files.
 * Simplified fork from Vite's `bundleConfigFile` function:
 * @see https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts#L961
 */
async function bundleConfigFile({
	markdocConfigUrl,
	astroConfig,
}: {
	markdocConfigUrl: URL;
	astroConfig: Pick<AstroConfig, 'root'>;
}): Promise<{ code: string; dependencies: string[] }> {
	let markdocError: MarkdocError | undefined;

	const result = await esbuild({
		absWorkingDir: fileURLToPath(astroConfig.root),
		entryPoints: [fileURLToPath(markdocConfigUrl)],
		outfile: 'out.js',
		write: false,
		target: ['node16'],
		platform: 'node',
		packages: 'external',
		bundle: true,
		format: 'esm',
		sourcemap: 'inline',
		metafile: true,
		plugins: [
			{
				name: 'stub-astro-imports',
				setup(build) {
					build.onResolve({ filter: /.*\.astro$/ }, () => {
						// Avoid throwing within esbuild.
						// This swallows the `hint` and blows up the stacktrace.
						markdocError = new MarkdocError({
							message: '`.astro` files are no longer supported in the Markdoc config.',
							hint: 'Use the `component()` utility to specify a component path instead. See https://docs.astro.build/en/guides/integrations-guide/markdoc/',
						});
						return {
							// Stub with an unused default export.
							path: 'data:text/javascript,export default true',
							external: true,
						};
					});
				},
			},
		],
	});
	if (markdocError) throw markdocError;
	const { text } = result.outputFiles[0];
	return {
		code: text,
		dependencies: result.metafile ? Object.keys(result.metafile.inputs) : [],
	};
}

/**
 * Forked from Vite config loader, replacing CJS-based path concat
 * with ESM only
 * @see https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts#L1074
 */
async function loadConfigFromBundledFile(root: URL, code: string): Promise<AstroMarkdocConfig> {
	// Write it to disk, load it with native Node ESM, then delete the file.
	const tmpFileUrl = new URL(`markdoc.config.timestamp-${Date.now()}.mjs`, root);
	fs.writeFileSync(tmpFileUrl, code);
	try {
		return (await import(tmpFileUrl.pathname)).default;
	} finally {
		try {
			fs.unlinkSync(tmpFileUrl);
		} catch {
			// already removed if this function is called twice simultaneously
		}
	}
}

import type { AstroConfig } from 'astro';
import type { Config as MarkdocConfig } from '@markdoc/markdoc';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import * as fs from 'node:fs';

const SUPPORTED_MARKDOC_CONFIG_FILES = [
	'markdoc.config.js',
	'markdoc.config.mjs',
	'markdoc.config.ts',
];

export async function loadMarkdocConfig(astroConfig: Pick<AstroConfig, 'root'>) {
	let markdocConfigUrl: URL | undefined;
	for (const filename of SUPPORTED_MARKDOC_CONFIG_FILES) {
		const filePath = new URL(filename, astroConfig.root);
		if (!fs.existsSync(filePath)) continue;

		markdocConfigUrl = filePath;
		break;
	}
	if (!markdocConfigUrl) return;

	const { code, dependencies } = await bundleConfigFile({
		markdocConfigUrl,
		astroConfig,
	});
	const config: MarkdocConfig = await loadConfigFromBundledFile(astroConfig.root, code);

	return {
		config,
		fileUrl: markdocConfigUrl,
	};
}

/**
 * Forked from Vite's `bundleConfigFile` function
 * with added handling for `.astro` imports,
 * and removed unused Deno patches.
 */
async function bundleConfigFile({
	markdocConfigUrl,
	astroConfig,
}: {
	markdocConfigUrl: URL;
	astroConfig: Pick<AstroConfig, 'root'>;
}): Promise<{ code: string; dependencies: string[] }> {
	const result = await build({
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
						return {
							// Stub with an unused default export
							path: 'data:text/javascript,export default true',
							external: true,
						};
					});
				},
			},
		],
	});
	const { text } = result.outputFiles[0];
	return {
		code: text,
		dependencies: result.metafile ? Object.keys(result.metafile.inputs) : [],
	};
}

async function loadConfigFromBundledFile(root: URL, code: string): Promise<MarkdocConfig> {
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

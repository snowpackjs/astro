import { posix, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { copyFilesToFolder } from '@astrojs/internal-helpers/fs';
import { appendForwardSlash } from '@astrojs/internal-helpers/path';
import type { AstroIntegrationLogger } from 'astro';
import { searchForWorkspaceRoot } from 'vite';

// Based on the equivalent function in `@astrojs/vercel`
export async function copyDependenciesToFunction(
	{
		entry,
		outDir,
		includeFiles,
		excludeFiles,
		logger,
		root,
	}: {
		entry: URL;
		outDir: URL;
		includeFiles: URL[];
		excludeFiles: URL[];
		logger: AstroIntegrationLogger;
		root: URL;
	},
	// we want to pass the caching by reference, and not by value
	cache: object,
): Promise<{ handler: string }> {
	const entryPath = fileURLToPath(entry);
	logger.info(`Bundling function ${relative(fileURLToPath(outDir), entryPath)}`);

	// Set the base to the workspace root
	const base = pathToFileURL(appendForwardSlash(searchForWorkspaceRoot(fileURLToPath(root))));

	// The Vite bundle includes an import to `@vercel/nft` for some reason,
	// and that trips up `@vercel/nft` itself during the adapter build. Using a
	// dynamic import helps prevent the issue.
	// TODO: investigate why
	const { nodeFileTrace } = await import('@vercel/nft');
	const result = await nodeFileTrace([entryPath], {
		base: fileURLToPath(base),
		cache,
	});

	for (const error of result.warnings) {
		if (error.message.startsWith('Failed to resolve dependency')) {
			const [, module, file] =
				/Cannot find module '(.+?)' loaded from (.+)/.exec(error.message) || [];

			// The import(astroRemark) sometimes fails to resolve, but it's not a problem
			if (module === '@astrojs/') continue;

			// Sharp is always external and won't be able to be resolved, but that's also not a problem
			if (module === 'sharp') continue;

			if (entryPath === file) {
				logger.debug(
					`The module "${module}" couldn't be resolved. This may not be a problem, but it's worth checking.`,
				);
			} else {
				logger.debug(
					`The module "${module}" inside the file "${file}" couldn't be resolved. This may not be a problem, but it's worth checking.`,
				);
			}
		}
		// parse errors are likely not js and can safely be ignored,
		// such as this html file in "main" meant for nw instead of node:
		// https://github.com/vercel/nft/issues/311
		else if (!error.message.startsWith('Failed to parse')) {
			throw error;
		}
	}

	const commonAncestor = await copyFilesToFolder(
		[...result.fileList].map((file) => new URL(file, base)).concat(includeFiles),
		outDir,
		excludeFiles,
	);

	return {
		// serverEntry location inside the outDir, converted to posix
		handler: relative(commonAncestor, entryPath).split(sep).join(posix.sep),
	};
}

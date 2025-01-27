import nodeFs from 'node:fs';
import npath from 'node:path';
import type * as vite from 'vite';
import { slash } from '../core/path.js';
import { cleanUrl } from '../vite-plugin-utils/index.js';

type NodeFileSystemModule = typeof nodeFs;

export interface LoadFallbackPluginParams {
	fs?: NodeFileSystemModule;
	root: URL;
}

export default function loadFallbackPlugin({
	fs,
	root,
}: LoadFallbackPluginParams): vite.Plugin[] | false {
	// Only add this plugin if a custom fs implementation is provided.
	// Also check for `fs.default` because `import * as fs from 'node:fs'` will
	// export as so, which only it's `.default` would === `nodeFs`.
	// @ts-expect-error check default
	if (!fs || fs === nodeFs || fs.default === nodeFs) {
		return false;
	}

	const tryLoadModule = async (id: string) => {
		try {
			// await is necessary for the catch
			return await fs.promises.readFile(cleanUrl(id), 'utf-8');
		} catch {
			try {
				return await fs.promises.readFile(id, 'utf-8');
			} catch {
				try {
					const fullpath = new URL('.' + id, root);
					return await fs.promises.readFile(fullpath, 'utf-8');
				} catch {
					// Let fall through to the next
				}
			}
		}
	};

	return [
		{
			name: 'astro:load-fallback',
			enforce: 'post',
			async resolveId(id, parent) {
				// See if this can be loaded from our fs
				if (parent) {
					const candidateId = npath.posix.join(npath.posix.dirname(slash(parent)), id);
					try {
						// Check to see if this file exists and is not a directory.
						const stats = await fs.promises.stat(candidateId);
						if (!stats.isDirectory()) {
							return candidateId;
						}
					} catch {}
				}
			},
			async load(id) {
				const source = await tryLoadModule(id);
				return source;
			},
		},
		{
			name: 'astro:load-fallback-hmr',
			enforce: 'pre',
			handleHotUpdate(context) {
				// Wrap context.read so it checks our filesystem first.
				const read = context.read;
				context.read = async () => {
					const source = await tryLoadModule(context.file);
					if (source) return source;
					return read.call(context);
				};
			},
		},
	];
}

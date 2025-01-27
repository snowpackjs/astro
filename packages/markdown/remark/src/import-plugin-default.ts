import path from 'node:path';
import { pathToFileURL } from 'node:url';
// This file should be imported as `#import-plugin`
import { resolve as importMetaResolve } from 'import-meta-resolve';
import type * as unified from 'unified';

let cwdUrlStr: string | undefined;

// In non-browser environments, we can try to resolve from the filesystem too
export async function importPlugin(p: string): Promise<unified.Plugin> {
	// Try import from this package first
	try {
		const importResult = await import(/* @vite-ignore */ p);
		return importResult.default;
	} catch {}

	// Try import from user project
	cwdUrlStr ??= pathToFileURL(path.join(process.cwd(), 'package.json')).toString();
	const resolved = importMetaResolve(p, cwdUrlStr);
	const importResult = await import(/* @vite-ignore */ resolved);
	return importResult.default;
}

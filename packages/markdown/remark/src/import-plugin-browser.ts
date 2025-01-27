// This file should be imported as `#import-plugin`
import type * as unified from 'unified';

// In the browser, we can try to do a plain import
export async function importPlugin(p: string): Promise<unified.Plugin> {
	const importResult = await import(p);
	return importResult.default;
}

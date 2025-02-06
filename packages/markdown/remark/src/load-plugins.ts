import type * as unified from 'unified';
import { importPlugin as _importPlugin } from '#import-plugin';

async function importPlugin(p: string | unified.Plugin<any[], any>) {
	if (typeof p === 'string') {
		return await _importPlugin(p);
	} else {
		return p;
	}
}

export function loadPlugins(
	items: (
		| string
		| [string, any]
		| unified.Plugin<any[], any>
		| [unified.Plugin<any[], any>, any]
	)[],
): Promise<[unified.Plugin, any?]>[] {
	return items.map((p) => {
		return new Promise((resolve, reject) => {
			if (Array.isArray(p)) {
				const [plugin, opts] = p;
				return importPlugin(plugin)
					.then((m) => resolve([m, opts]))
					.catch((e) => reject(e));
			}

			return importPlugin(p)
				.then((m) => resolve([m]))
				.catch((e) => reject(e));
		});
	});
}

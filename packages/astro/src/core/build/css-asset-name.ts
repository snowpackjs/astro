import type { GetModuleInfo, ModuleInfo } from 'rollup';

import crypto from 'node:crypto';
import npath from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroSettings } from '../../types/astro.js';
import { viteID } from '../util.js';
import { normalizePath } from '../viteUtils.js';
import { getTopLevelPageModuleInfos } from './graph.js';

// These pages could be used as base names for the chunk hashed name, but they are confusing
// and should be avoided it possible
const confusingBaseNames = ['404', '500'];

// The short name for when the hash can be included
// We could get rid of this and only use the createSlugger implementation, but this creates
// slightly prettier names.
export function shortHashedName(settings: AstroSettings) {
	return function (id: string, ctx: { getModuleInfo: GetModuleInfo }): string {
		const parents = getTopLevelPageModuleInfos(id, ctx);
		return createNameHash(
			getFirstParentId(parents),
			parents.map((page) => page.id),
			settings,
		);
	};
}

export function createNameHash(
	baseId: string | undefined,
	hashIds: string[],
	settings: AstroSettings,
): string {
	const baseName = baseId ? prettifyBaseName(npath.parse(baseId).name) : 'index';
	const hash = crypto.createHash('sha256');
	const root = fileURLToPath(settings.config.root);

	for (const id of hashIds) {
		// Strip the project directory from the paths before they are hashed, so that assets
		// that import these css files have consistent hashes when built in different environments.
		const relativePath = npath.relative(root, id);
		// Normalize the path to fix differences between windows and other environments
		hash.update(normalizePath(relativePath), 'utf-8');
	}
	const h = hash.digest('hex').slice(0, 8);
	const proposedName = baseName + '.' + h;
	return proposedName;
}

export function createSlugger(settings: AstroSettings) {
	const pagesDir = viteID(new URL('./pages', settings.config.srcDir));
	const indexPage = viteID(new URL('./pages/index', settings.config.srcDir));
	const map = new Map<string, Map<string, number>>();
	const sep = '-';
	return function (id: string, ctx: { getModuleInfo: GetModuleInfo }): string {
		const parents = Array.from(getTopLevelPageModuleInfos(id, ctx));
		const allParentsKey = parents
			.map((page) => page.id)
			.sort()
			.join('-');
		const firstParentId = getFirstParentId(parents) || indexPage;

		// Use the last two segments, for ex /docs/index
		let dir = firstParentId;
		let key = '';
		let i = 0;
		while (i < 2) {
			if (dir === pagesDir) {
				break;
			}

			const name = prettifyBaseName(npath.parse(npath.basename(dir)).name);
			key = key.length ? name + sep + key : name;
			dir = npath.dirname(dir);
			i++;
		}

		// Keep track of how many times this was used.
		let name = key;

		// The map keeps track of how many times a key, like `pages_index` is used as the name.
		// If the same key is used more than once we increment a number so it becomes `pages-index-1`.
		// This guarantees that it stays unique, without sacrificing pretty names.
		if (!map.has(key)) {
			map.set(key, new Map([[allParentsKey, 0]]));
		} else {
			const inner = map.get(key)!;
			if (inner.has(allParentsKey)) {
				const num = inner.get(allParentsKey)!;
				if (num > 0) {
					name = name + sep + num;
				}
			} else {
				const num = inner.size;
				inner.set(allParentsKey, num);
				name = name + sep + num;
			}
		}

		return name;
	};
}

/**
 * Find the first parent id from `parents` where its name is not confusing.
 * Returns undefined if there's no parents.
 */
function getFirstParentId(parents: ModuleInfo[]) {
	for (const parent of parents) {
		const id = parent.id;
		const baseName = npath.parse(id).name;
		if (!confusingBaseNames.includes(baseName)) {
			return id;
		}
	}
	// If all parents are confusing, just use the first one. Or if there's no
	// parents, this will return undefined.
	return parents[0]?.id;
}

const charsToReplaceRe = /[.[\]]/g;
const underscoresRe = /_+/g;
/**
 * Prettify base names so they're easier to read:
 * - index -> index
 * - [slug] -> _slug_
 * - [...spread] -> _spread_
 */
function prettifyBaseName(str: string) {
	return str.replace(charsToReplaceRe, '_').replace(underscoresRe, '_');
}

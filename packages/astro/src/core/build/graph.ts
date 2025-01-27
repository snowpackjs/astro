import type { GetModuleInfo, ModuleInfo } from 'rollup';

import { ASTRO_PAGE_RESOLVED_MODULE_ID } from './plugins/plugin-pages.js';

interface ExtendedModuleInfo {
	info: ModuleInfo;
	depth: number;
	order: number;
}

// This walks up the dependency graph and yields out each ModuleInfo object.
export function getParentExtendedModuleInfos(
	id: string,
	ctx: { getModuleInfo: GetModuleInfo },
	until?: (importer: string) => boolean,
	depth = 0,
	order = 0,
	childId = '',
	seen = new Set<string>(),
	accumulated: ExtendedModuleInfo[] = [],
): ExtendedModuleInfo[] {
	seen.add(id);

	const info = ctx.getModuleInfo(id);
	if (info) {
		if (childId) {
			const idx = info.importedIds.indexOf(childId);
			if (idx === -1) {
				// Dynamic imports come after all normal imports. So first add the number of normal imports.
				order += info.importedIds.length;
				// Then add on the dynamic ones.
				order += info.dynamicallyImportedIds.indexOf(childId);
			} else {
				order += idx;
			}
		}
		accumulated.push({ info, depth, order });
	}

	if (info && !until?.(id)) {
		const importers = info.importers.concat(info.dynamicImporters);
		for (const imp of importers) {
			if (!seen.has(imp)) {
				getParentExtendedModuleInfos(imp, ctx, until, depth + 1, order, id, seen, accumulated);
			}
		}
	}

	return accumulated;
}

export function getParentModuleInfos(
	id: string,
	ctx: { getModuleInfo: GetModuleInfo },
	until?: (importer: string) => boolean,
	seen = new Set<string>(),
	accumulated: ModuleInfo[] = [],
): ModuleInfo[] {
	seen.add(id);

	const info = ctx.getModuleInfo(id);
	if (info) {
		accumulated.push(info);
	}

	if (info && !until?.(id)) {
		const importers = info.importers.concat(info.dynamicImporters);
		for (const imp of importers) {
			if (!seen.has(imp)) {
				getParentModuleInfos(imp, ctx, until, seen, accumulated);
			}
		}
	}

	return accumulated;
}

// Returns true if a module is a top-level page. We determine this based on whether
// it is imported by the top-level virtual module.
export function moduleIsTopLevelPage(info: ModuleInfo): boolean {
	return (
		info.importers[0]?.includes(ASTRO_PAGE_RESOLVED_MODULE_ID) ||
		info.dynamicImporters[0]?.includes(ASTRO_PAGE_RESOLVED_MODULE_ID)
	);
}

// This function walks the dependency graph, going up until it finds a page component.
// This could be a .astro page, a .markdown or a .md (or really any file extension for markdown files) page.
export function getTopLevelPageModuleInfos(
	id: string,
	ctx: { getModuleInfo: GetModuleInfo },
): ModuleInfo[] {
	return getParentModuleInfos(id, ctx).filter(moduleIsTopLevelPage);
}

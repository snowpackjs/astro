import type { ModuleInfo, ModuleLoader } from '../core/module-loader/index.js';
import { viteID } from '../core/util.js';

type GetPrerenderStatusParams = {
	filePath: URL;
	loader: ModuleLoader;
};

export function getPrerenderStatus({
	filePath,
	loader,
}: GetPrerenderStatusParams): boolean | undefined {
	const fileID = viteID(filePath);
	const moduleInfo = loader.getModuleInfo(fileID);
	if (!moduleInfo) return;
	const prerenderStatus = getPrerenderMetadata(moduleInfo);
	return prerenderStatus;
}

export function getPrerenderMetadata(moduleInfo: ModuleInfo) {
	return moduleInfo?.meta?.astro?.pageOptions?.prerender;
}

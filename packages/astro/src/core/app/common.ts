import { deserializeRouteData } from '../routing/manifest/serialization.js';
import type { RouteInfo, SSRManifest, SerializedSSRManifest } from './types.js';
export { getSegmentsFromRoutePath } from '../routing/manifest/create.js'

export function deserializeManifest(serializedManifest: SerializedSSRManifest): SSRManifest {
	const routes: RouteInfo[] = [];
	for (const serializedRoute of serializedManifest.routes) {
		routes.push({
			...serializedRoute,
			routeData: deserializeRouteData(serializedRoute.routeData),
		});

		const route = serializedRoute as unknown as RouteInfo;
		route.routeData = deserializeRouteData(serializedRoute.routeData);
	}

	const assets = new Set<string>(serializedManifest.assets);
	const componentMetadata = new Map(serializedManifest.componentMetadata);
	const inlinedScripts = new Map(serializedManifest.inlinedScripts);
	const clientDirectives = new Map(serializedManifest.clientDirectives);
	const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);

	return {
		// in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
		middleware(_, next) {
			return next();
		},
		...serializedManifest,
		assets,
		componentMetadata,
		inlinedScripts,
		clientDirectives,
		routes,
		serverIslandNameMap,
	};
}

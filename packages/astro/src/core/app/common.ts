import { decodeKey } from '../encryption.js';
import { NOOP_MIDDLEWARE_FN } from '../middleware/noop-middleware.js';
import { deserializeRouteData } from '../routing/manifest/serialization.js';
import type { RouteInfo, SSRManifest, SerializedSSRManifest } from './types.js';

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
	const key = decodeKey(serializedManifest.key);

	return {
		// in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
		middleware() {
			return { onRequest: NOOP_MIDDLEWARE_FN };
		},
		...serializedManifest,
		assets,
		componentMetadata,
		inlinedScripts,
		clientDirectives,
		routes,
		serverIslandNameMap,
		key,
	};
}

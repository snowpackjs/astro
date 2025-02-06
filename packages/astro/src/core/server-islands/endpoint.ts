import {
	type AstroComponentFactory,
	type ComponentSlots,
	renderComponent,
	renderTemplate,
} from '../../runtime/server/index.js';
import { isAstroComponentFactory } from '../../runtime/server/render/astro/factory.js';
import { createSlotValueFromString } from '../../runtime/server/render/slot.js';
import type { ComponentInstance, RoutesList } from '../../types/astro.js';
import type { RouteData, SSRManifest } from '../../types/public/internal.js';
import { decryptString } from '../encryption.js';
import { getPattern } from '../routing/manifest/pattern.js';

export const SERVER_ISLAND_ROUTE = '/_server-islands/[name]';
export const SERVER_ISLAND_COMPONENT = '_server-islands.astro';
export const SERVER_ISLAND_BASE_PREFIX = '_server-islands';

type ConfigFields = Pick<SSRManifest, 'base' | 'trailingSlash'>;

export function getServerIslandRouteData(config: ConfigFields) {
	const segments = [
		[{ content: '_server-islands', dynamic: false, spread: false }],
		[{ content: 'name', dynamic: true, spread: false }],
	];
	const route: RouteData = {
		type: 'page',
		component: SERVER_ISLAND_COMPONENT,
		generate: () => '',
		params: ['name'],
		segments,
		pattern: getPattern(segments, config.base, config.trailingSlash),
		prerender: false,
		isIndex: false,
		fallbackRoutes: [],
		route: SERVER_ISLAND_ROUTE,
		origin: 'internal',
	};
	return route;
}

export function injectServerIslandRoute(config: ConfigFields, routeManifest: RoutesList) {
	routeManifest.routes.unshift(getServerIslandRouteData(config));
}

type RenderOptions = {
	componentExport: string;
	encryptedProps: string;
	slots: Record<string, string>;
};

function badRequest(reason: string) {
	return new Response(null, {
		status: 400,
		statusText: 'Bad request: ' + reason,
	});
}

async function getRequestData(request: Request): Promise<Response | RenderOptions> {
	switch (request.method) {
		case 'GET': {
			const url = new URL(request.url);
			const params = url.searchParams;

			if (!params.has('s') || !params.has('e') || !params.has('p')) {
				return badRequest('Missing required query parameters.');
			}

			const rawSlots = params.get('s')!;
			try {
				return {
					componentExport: params.get('e')!,
					encryptedProps: params.get('p')!,
					slots: JSON.parse(rawSlots),
				};
			} catch {
				return badRequest('Invalid slots format.');
			}
		}
		case 'POST': {
			try {
				const raw = await request.text();
				const data = JSON.parse(raw) as RenderOptions;
				return data;
			} catch {
				return badRequest('Request format is invalid.');
			}
		}
		default: {
			// Method not allowed: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405
			return new Response(null, { status: 405 });
		}
	}
}

export function createEndpoint(manifest: SSRManifest) {
	const page: AstroComponentFactory = async (result) => {
		const params = result.params;
		if (!params.name) {
			return new Response(null, {
				status: 400,
				statusText: 'Bad request',
			});
		}
		const componentId = params.name;

		// Get the request data from the body or search params
		const data = await getRequestData(result.request);
		// probably error
		if (data instanceof Response) {
			return data;
		}

		const imp = manifest.serverIslandMap?.get(componentId);
		if (!imp) {
			return new Response(null, {
				status: 404,
				statusText: 'Not found',
			});
		}

		const key = await manifest.key;
		const encryptedProps = data.encryptedProps;

		const propString = encryptedProps === '' ? '{}' : await decryptString(key, encryptedProps);
		const props = JSON.parse(propString);

		const componentModule = await imp();
		let Component = (componentModule as any)[data.componentExport];

		const slots: ComponentSlots = {};
		for (const prop in data.slots) {
			slots[prop] = createSlotValueFromString(data.slots[prop]);
		}

		// Prevent server islands from being indexed
		result.response.headers.set('X-Robots-Tag', 'noindex');

		// Wrap Astro components so we can set propagation to
		// `self` which is needed to force the runtime to wait
		// on the component before sending out the response headers.
		// This allows the island to set headers (cookies).
		if (isAstroComponentFactory(Component)) {
			const ServerIsland = Component;
			Component = function (this: typeof ServerIsland, ...args: Parameters<typeof ServerIsland>) {
				return ServerIsland.apply(this, args);
			};
			Object.assign(Component, ServerIsland);
			Component.propagation = 'self';
		}

		return renderTemplate`${renderComponent(result, 'Component', Component, props, slots)}`;
	};

	page.isAstroComponentFactory = true;

	const instance: ComponentInstance = {
		default: page,
		partial: true,
	};

	return instance;
}

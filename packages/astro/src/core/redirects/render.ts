import type { RenderContext } from '../render-context.js';

export async function renderRedirect(renderContext: RenderContext) {
	const {
		request: { method },
		routeData,
	} = renderContext;
	const { redirect, redirectRoute } = routeData;
	const status =
		redirectRoute && typeof redirect === 'object' ? redirect.status : method === 'GET' ? 301 : 308;
	const headers = { location: encodeURI(redirectRouteGenerate(renderContext)) };
	return new Response(null, { status, headers });
}

function redirectRouteGenerate(renderContext: RenderContext): string {
	const {
		params,
		routeData: { redirect, redirectRoute },
	} = renderContext;

	if (typeof redirectRoute !== 'undefined') {
		return redirectRoute?.generate(params) || redirectRoute?.pathname || '/';
	} else if (typeof redirect === 'string') {
		// TODO: this logic is duplicated between here and manifest/create.ts
		let target = redirect;
		for (const param of Object.keys(params)) {
			const paramValue = params[param]!;
			target = target.replace(`[${param}]`, paramValue).replace(`[...${param}]`, paramValue);
		}
		return target;
	} else if (typeof redirect === 'undefined') {
		return '/';
	}
	return redirect.destination;
}

import type { RedirectConfig } from '../../types/public/index.js';
import type { RenderContext } from '../render-context.js';

export function redirectIsExternal(redirect: RedirectConfig): boolean {
	if (typeof redirect === 'string') {
		return redirect.startsWith('http://') || redirect.startsWith('https://');
	} else {
		return (
			redirect.destination.startsWith('http://') || redirect.destination.startsWith('https://')
		);
	}
}

export async function renderRedirect(renderContext: RenderContext) {
	const {
		request: { method },
		routeData,
	} = renderContext;
	const { redirect, redirectRoute } = routeData;
	const status =
		redirectRoute && typeof redirect === 'object' ? redirect.status : method === 'GET' ? 301 : 308;
	const headers = { location: encodeURI(redirectRouteGenerate(renderContext)) };
	if (redirect && redirectIsExternal(redirect)) {
		if (typeof redirect === 'string') {
			return Response.redirect(redirect, status);
		} else {
			return Response.redirect(redirect.destination, status);
		}
	}
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
		if (redirectIsExternal(redirect)) {
			return redirect;
		} else {
			let target = redirect;
			for (const param of Object.keys(params)) {
				const paramValue = params[param]!;
				target = target.replace(`[${param}]`, paramValue).replace(`[...${param}]`, paramValue);
			}
			return target;
		}
	} else if (typeof redirect === 'undefined') {
		return '/';
	}
	return redirect.destination;
}

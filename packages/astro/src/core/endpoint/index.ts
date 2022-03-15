import type { EndpointHandler } from '../../@types/astro';
import type { RenderOptions } from '../render/core';
import type { AstroRequest } from '../render/request';
import { renderEndpoint } from '../../runtime/server/index.js';
import { getParamsAndProps } from '../render/core.js';

type EndpointOptions = Pick<RenderOptions,
	'logging' |
	'route' |
	'routeCache' |
	'pathname' |
	'route'
> & {
	request: AstroRequest
};

type EndpointCallResult = {
	type: 'simple',
	body: string
} | {
	type: 'response',
	response: Response
};

export async function call(mod: EndpointHandler, opts: EndpointOptions): Promise<EndpointCallResult> {
	const params = getParamsAndProps({ ...opts, mod: (mod as any) });

	// TODO mod is not typed properly
	const response = await renderEndpoint(mod, opts.request, params);

	if(response instanceof Response) {
		return {
			type: 'response',
			response
		};
	}

	return {
		type: 'simple',
		body: response.body
	};
}

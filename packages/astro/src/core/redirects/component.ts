import type { ComponentInstance } from '../../types/astro.js';
import type { SinglePageBuiltModule } from '../build/types.js';

// A stub of a component instance for a given route
export const RedirectComponentInstance: ComponentInstance = {
	default() {
		return new Response(null, {
			status: 301,
		});
	},
};

export const RedirectSinglePageBuiltModule: SinglePageBuiltModule = {
	page: () => Promise.resolve(RedirectComponentInstance),
	onRequest: (_, next) => next(),
	renderers: [],
};

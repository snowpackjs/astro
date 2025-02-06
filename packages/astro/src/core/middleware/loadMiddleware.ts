import { MiddlewareCantBeLoaded } from '../errors/errors-data.js';
import { AstroError } from '../errors/index.js';
import type { ModuleLoader } from '../module-loader/index.js';
import { MIDDLEWARE_MODULE_ID } from './vite-plugin.js';

/**
 * It accepts a module loader and the astro settings, and it attempts to load the middlewares defined in the configuration.
 *
 * If not middlewares were not set, the function returns an empty array.
 */
export async function loadMiddleware(moduleLoader: ModuleLoader) {
	try {
		return await moduleLoader.import(MIDDLEWARE_MODULE_ID);
	} catch (error: any) {
		const astroError = new AstroError(MiddlewareCantBeLoaded, { cause: error });
		throw astroError;
	}
}

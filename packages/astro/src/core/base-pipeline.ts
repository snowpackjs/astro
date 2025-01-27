import { createI18nMiddleware } from '../i18n/middleware.js';
import type { ComponentInstance } from '../types/astro.js';
import type { MiddlewareHandler, RewritePayload } from '../types/public/common.js';
import type { RuntimeMode } from '../types/public/config.js';
import type {
	RouteData,
	SSRLoadedRenderer,
	SSRManifest,
	SSRResult,
} from '../types/public/internal.js';
import { createOriginCheckMiddleware } from './app/middlewares.js';
import type { Logger } from './logger/core.js';
import { NOOP_MIDDLEWARE_FN } from './middleware/noop-middleware.js';
import { sequence } from './middleware/sequence.js';
import { RouteCache } from './render/route-cache.js';
import { createDefaultRoutes } from './routing/default.js';

/**
 * The `Pipeline` represents the static parts of rendering that do not change between requests.
 * These are mostly known when the server first starts up and do not change.
 *
 * Thus, a `Pipeline` is created once at process start and then used by every `RenderContext`.
 */
export abstract class Pipeline {
	readonly internalMiddleware: MiddlewareHandler[];
	resolvedMiddleware: MiddlewareHandler | undefined = undefined;

	constructor(
		readonly logger: Logger,
		readonly manifest: SSRManifest,
		/**
		 * "development" or "production" only
		 */
		readonly runtimeMode: RuntimeMode,
		readonly renderers: SSRLoadedRenderer[],
		readonly resolve: (s: string) => Promise<string>,
		/**
		 * Based on Astro config's `output` option, `true` if "server" or "hybrid".
		 */
		readonly serverLike: boolean,
		readonly streaming: boolean,
		/**
		 * Used to provide better error messages for `Astro.clientAddress`
		 */
		readonly adapterName = manifest.adapterName,
		readonly clientDirectives = manifest.clientDirectives,
		readonly inlinedScripts = manifest.inlinedScripts,
		readonly compressHTML = manifest.compressHTML,
		readonly i18n = manifest.i18n,
		readonly middleware = manifest.middleware,
		readonly routeCache = new RouteCache(logger, runtimeMode),
		/**
		 * Used for `Astro.site`.
		 */
		readonly site = manifest.site ? new URL(manifest.site) : undefined,
		/**
		 * Array of built-in, internal, routes.
		 * Used to find the route module
		 */
		readonly defaultRoutes = createDefaultRoutes(manifest),
	) {
		this.internalMiddleware = [];
		// We do use our middleware only if the user isn't using the manual setup
		if (i18n?.strategy !== 'manual') {
			this.internalMiddleware.push(
				createI18nMiddleware(i18n, manifest.base, manifest.trailingSlash, manifest.buildFormat),
			);
		}
	}

	abstract headElements(routeData: RouteData): Promise<HeadElements> | HeadElements;

	abstract componentMetadata(routeData: RouteData): Promise<SSRResult['componentMetadata']> | void;

	/**
	 * It attempts to retrieve the `RouteData` that matches the input `url`, and the component that belongs to the `RouteData`.
	 *
	 * ## Errors
	 *
	 * - if not `RouteData` is found
	 *
	 * @param {RewritePayload} rewritePayload The payload provided by the user
	 * @param {Request} request The original request
	 */
	abstract tryRewrite(rewritePayload: RewritePayload, request: Request): Promise<TryRewriteResult>;

	/**
	 * Tells the pipeline how to retrieve a component give a `RouteData`
	 * @param routeData
	 */
	abstract getComponentByRoute(routeData: RouteData): Promise<ComponentInstance>;

	/**
	 * Resolves the middleware from the manifest, and returns the `onRequest` function. If `onRequest` isn't there,
	 * it returns a no-op function
	 */
	async getMiddleware(): Promise<MiddlewareHandler> {
		if (this.resolvedMiddleware) {
			return this.resolvedMiddleware;
		}
		// The middleware can be undefined when using edge middleware.
		// This is set to undefined by the plugin-ssr.ts
		else if (this.middleware) {
			const middlewareInstance = await this.middleware();
			const onRequest = middlewareInstance.onRequest ?? NOOP_MIDDLEWARE_FN;
			if (this.manifest.checkOrigin) {
				this.resolvedMiddleware = sequence(createOriginCheckMiddleware(), onRequest);
			} else {
				this.resolvedMiddleware = onRequest;
			}
			return this.resolvedMiddleware;
		} else {
			this.resolvedMiddleware = NOOP_MIDDLEWARE_FN;
			return this.resolvedMiddleware;
		}
	}
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HeadElements extends Pick<SSRResult, 'scripts' | 'styles' | 'links'> {}

export interface TryRewriteResult {
	routeData: RouteData;
	componentInstance: ComponentInstance;
	newUrl: URL;
	pathname: string;
}

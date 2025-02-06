import './polyfill.js';
import { posix } from 'node:path';
import { getDefaultClientDirectives } from '../core/client-directive/index.js';
import { ASTRO_CONFIG_DEFAULTS } from '../core/config/schema.js';
import { validateConfig } from '../core/config/validate.js';
import { createKey } from '../core/encryption.js';
import { Logger } from '../core/logger/core.js';
import { nodeLogDestination } from '../core/logger/node.js';
import { NOOP_MIDDLEWARE_FN } from '../core/middleware/noop-middleware.js';
import { removeLeadingForwardSlash } from '../core/path.js';
import { RenderContext } from '../core/render-context.js';
import { getParts } from '../core/routing/manifest/parts.js';
import { getPattern } from '../core/routing/manifest/pattern.js';
import { validateSegment } from '../core/routing/manifest/segment.js';
import type { AstroComponentFactory } from '../runtime/server/index.js';
import type { ComponentInstance } from '../types/astro.js';
import type { AstroMiddlewareInstance, MiddlewareHandler, Props } from '../types/public/common.js';
import type { AstroConfig, AstroUserConfig } from '../types/public/config.js';
import type {
	NamedSSRLoadedRendererValue,
	RouteData,
	RouteType,
	SSRLoadedRenderer,
	SSRLoadedRendererValue,
	SSRManifest,
	SSRResult,
} from '../types/public/internal.js';
import { ContainerPipeline } from './pipeline.js';

/** Public type, used for integrations to define a renderer for the container API */
export type ContainerRenderer = {
	/**
	 * The name of the renderer.
	 */
	name: string;
	/**
	 * The entrypoint that is used to render a component on the server
	 */
	serverEntrypoint: string;
};

/**
 * Options to be passed when rendering a route
 */
export type ContainerRenderOptions = {
	/**
	 * If your component renders slots, that's where you want to fill the slots.
	 * A single slot should have the `default` field:
	 *
	 * ## Examples
	 *
	 * **Default slot**
	 *
	 * ```js
	 * container.renderToString(Component, { slots: { default: "Some value"}});
	 * ```
	 *
	 * **Named slots**
	 *
	 * ```js
	 * container.renderToString(Component, { slots: { "foo": "Some value", "bar": "Lorem Ipsum" }});
	 * ```
	 */
	slots?: Record<string, any>;
	/**
	 * The request is used to understand which path/URL the component is about to render.
	 *
	 * Use this option in case your component or middleware needs to read information like `Astro.url` or `Astro.request`.
	 */
	request?: Request;
	/**
	 * Useful for dynamic routes. If your component is something like `src/pages/blog/[id]/[...slug]`, you'll want to provide:
	 * ```js
	 * container.renderToString(Component, { params: ["id", "...slug"] });
	 * ```
	 */
	params?: Record<string, string | undefined>;
	/**
	 * Useful if your component needs to access some locals without the use a middleware.
	 * ```js
	 * container.renderToString(Component, { locals: { getSomeValue() {} } });
	 * ```
	 */
	locals?: App.Locals;
	/**
	 * Useful in case you're attempting to render an endpoint:
	 * ```js
	 * container.renderToString(Endpoint, { routeType: "endpoint" });
	 * ```
	 */
	routeType?: RouteType;

	/**
	 * Allows to pass `Astro.props` to an Astro component:
	 *
	 * ```js
	 * container.renderToString(Endpoint, { props: { "lorem": "ipsum" } });
	 * ```
	 */
	props?: Props;

	/**
	 * When `false`, it forces to render the component as it was a full-fledged page.
	 *
	 * By default, the container API render components as [partials](https://docs.astro.build/en/basics/astro-pages/#page-partials).
	 *
	 */
	partial?: boolean;
};

export type AddServerRenderer =
	| {
			renderer: NamedSSRLoadedRendererValue;
			name: never;
	  }
	| {
			renderer: SSRLoadedRendererValue;
			name: string;
	  };

export type AddClientRenderer = {
	name: string;
	entrypoint: string;
};

type ContainerImportRendererFn = (
	containerRenderer: ContainerRenderer,
) => Promise<SSRLoadedRenderer>;

function createManifest(
	manifest?: AstroContainerManifest,
	renderers?: SSRLoadedRenderer[],
	middleware?: MiddlewareHandler,
): SSRManifest {
	function middlewareInstance(): AstroMiddlewareInstance {
		return {
			onRequest: middleware ?? NOOP_MIDDLEWARE_FN,
		};
	}

	return {
		hrefRoot: import.meta.url,
		srcDir: manifest?.srcDir ?? ASTRO_CONFIG_DEFAULTS.srcDir,
		buildClientDir: manifest?.buildClientDir ?? ASTRO_CONFIG_DEFAULTS.build.client,
		buildServerDir: manifest?.buildServerDir ?? ASTRO_CONFIG_DEFAULTS.build.server,
		publicDir: manifest?.publicDir ?? ASTRO_CONFIG_DEFAULTS.publicDir,
		outDir: manifest?.outDir ?? ASTRO_CONFIG_DEFAULTS.outDir,
		cacheDir: manifest?.cacheDir ?? ASTRO_CONFIG_DEFAULTS.cacheDir,
		trailingSlash: manifest?.trailingSlash ?? ASTRO_CONFIG_DEFAULTS.trailingSlash,
		buildFormat: manifest?.buildFormat ?? ASTRO_CONFIG_DEFAULTS.build.format,
		compressHTML: manifest?.compressHTML ?? ASTRO_CONFIG_DEFAULTS.compressHTML,
		assets: manifest?.assets ?? new Set(),
		assetsPrefix: manifest?.assetsPrefix ?? undefined,
		entryModules: manifest?.entryModules ?? {},
		routes: manifest?.routes ?? [],
		adapterName: '',
		clientDirectives: manifest?.clientDirectives ?? getDefaultClientDirectives(),
		renderers: renderers ?? manifest?.renderers ?? [],
		base: manifest?.base ?? ASTRO_CONFIG_DEFAULTS.base,
		componentMetadata: manifest?.componentMetadata ?? new Map(),
		inlinedScripts: manifest?.inlinedScripts ?? new Map(),
		i18n: manifest?.i18n,
		checkOrigin: false,
		middleware: manifest?.middleware ?? middlewareInstance,
		key: createKey(),
	};
}

export type AstroContainerUserConfig = Omit<AstroUserConfig, 'integrations' | 'adapter'>;

/**
 * Options that are used for the entire lifecycle of the current instance of the container.
 */
export type AstroContainerOptions = {
	/**
	 * @default false
	 *
	 * @description
	 *
	 * Enables streaming during rendering
	 *
	 * ## Example
	 *
	 * ```js
	 * const container = await AstroContainer.create({
	 * 	streaming: true
	 * });
	 * ```
	 */
	streaming?: boolean;
	/**
	 * @default []
	 * @description
	 *
	 * List or renderers to use when rendering components. Usually, you want to pass these in an SSR context.
	 */
	renderers?: SSRLoadedRenderer[];
	/**
	 * @default {}
	 * @description
	 *
	 * A subset of the astro configuration object.
	 *
	 * ## Example
	 *
	 * ```js
	 * const container = await AstroContainer.create({
	 * 	astroConfig: {
	 * 		trailingSlash: "never"
	 * 	}
	 * });
	 * ```
	 */
	astroConfig?: AstroContainerUserConfig;

	// TODO: document out of experimental
	resolve?: SSRResult['resolve'];

	/**
	 * @default {}
	 * @description
	 *
	 * The raw manifest from the build output.
	 */
	manifest?: SSRManifest;
};

type AstroContainerManifest = Pick<
	SSRManifest,
	| 'middleware'
	| 'clientDirectives'
	| 'inlinedScripts'
	| 'componentMetadata'
	| 'renderers'
	| 'assetsPrefix'
	| 'base'
	| 'routes'
	| 'assets'
	| 'entryModules'
	| 'compressHTML'
	| 'trailingSlash'
	| 'buildFormat'
	| 'i18n'
	| 'srcDir'
	| 'buildClientDir'
	| 'buildServerDir'
	| 'publicDir'
	| 'outDir'
	| 'cacheDir'
>;

type AstroContainerConstructor = {
	streaming?: boolean;
	renderers?: SSRLoadedRenderer[];
	manifest?: AstroContainerManifest;
	resolve?: SSRResult['resolve'];
	astroConfig?: AstroConfig;
};

export class experimental_AstroContainer {
	#pipeline: ContainerPipeline;

	/**
	 * Internally used to check if the container was created with a manifest.
	 * @private
	 */
	#withManifest = false;

	/**
	 * Internal function responsible for importing a renderer
	 * @private
	 */
	#getRenderer: ContainerImportRendererFn | undefined;

	private constructor({
		streaming = false,
		manifest,
		renderers,
		resolve,
		astroConfig,
	}: AstroContainerConstructor) {
		this.#pipeline = ContainerPipeline.create({
			logger: new Logger({
				level: 'info',
				dest: nodeLogDestination,
			}),
			manifest: createManifest(manifest, renderers),
			streaming,
			serverLike: true,
			renderers: renderers ?? manifest?.renderers ?? [],
			resolve: async (specifier: string) => {
				if (this.#withManifest) {
					return this.#containerResolve(specifier, astroConfig);
				} else if (resolve) {
					return resolve(specifier);
				}
				return specifier;
			},
		});
	}

	async #containerResolve(specifier: string, astroConfig?: AstroConfig): Promise<string> {
		const found = this.#pipeline.manifest.entryModules[specifier];
		if (found) {
			return new URL(found, astroConfig?.build.client).toString();
		}
		return found;
	}

	/**
	 * Creates a new instance of a container.
	 *
	 * @param {AstroContainerOptions=} containerOptions
	 */
	public static async create(
		containerOptions: AstroContainerOptions = {},
	): Promise<experimental_AstroContainer> {
		const { streaming = false, manifest, renderers = [], resolve } = containerOptions;
		const astroConfig = await validateConfig(ASTRO_CONFIG_DEFAULTS, process.cwd(), 'container');
		return new experimental_AstroContainer({
			streaming,
			manifest,
			renderers,
			astroConfig,
			resolve,
		});
	}

	/**
	 * Use this function to manually add a **server** renderer to the container.
	 *
	 * This function is preferred when you require to use the container with a renderer in environments such as on-demand pages.
	 *
	 * ## Example
	 *
	 * ```js
	 * import reactRenderer from "@astrojs/react/server.js";
	 * import vueRenderer from "@astrojs/vue/server.js";
	 * import customRenderer from "../renderer/customRenderer.js";
	 * import { experimental_AstroContainer as AstroContainer } from "astro/container"
	 *
	 * const container = await AstroContainer.create();
	 * container.addServerRenderer(reactRenderer);
	 * container.addServerRenderer(vueRenderer);
	 * container.addServerRenderer("customRenderer", customRenderer);
	 * ```
	 *
	 * @param options {object}
	 * @param options.name The name of the renderer. The name **isn't** arbitrary, and it should match the name of the package.
	 * @param options.renderer The server renderer exported by integration.
	 */
	public addServerRenderer(options: AddServerRenderer): void {
		const { renderer, name } = options;
		if (!renderer.check || !renderer.renderToStaticMarkup) {
			throw new Error(
				"The renderer you passed isn't valid. A renderer is usually an object that exposes the `check` and `renderToStaticMarkup` functions.\n" +
					"Usually, the renderer is exported by a /server.js entrypoint e.g. `import renderer from '@astrojs/react/server.js'`",
			);
		}
		if (isNamedRenderer(renderer)) {
			this.#pipeline.manifest.renderers.push({
				name: renderer.name,
				ssr: renderer,
			});
		} else {
			this.#pipeline.manifest.renderers.push({
				name,
				ssr: renderer,
			});
		}
	}

	/**
	 * Use this function to manually add a **client** renderer to the container.
	 *
	 * When rendering components that use the `client:*` directives, you need to use this function.
	 *
	 * ## Example
	 *
	 * ```js
	 * import reactRenderer from "@astrojs/react/server.js";
	 * import { experimental_AstroContainer as AstroContainer } from "astro/container"
	 *
	 * const container = await AstroContainer.create();
	 * container.addServerRenderer(reactRenderer);
	 * container.addClientRenderer({
	 * 	name: "@astrojs/react",
	 * 	entrypoint: "@astrojs/react/client.js"
	 * });
	 * ```
	 *
	 * @param options {object}
	 * @param options.name The name of the renderer. The name **isn't** arbitrary, and it should match the name of the package.
	 * @param options.entrypoint The entrypoint of the client renderer.
	 */
	public addClientRenderer(options: AddClientRenderer): void {
		const { entrypoint, name } = options;

		const rendererIndex = this.#pipeline.manifest.renderers.findIndex((r) => r.name === name);
		if (rendererIndex === -1) {
			throw new Error(
				'You tried to add the ' +
					name +
					" client renderer, but its server renderer wasn't added. You must add the server renderer first. Use the `addServerRenderer` function.",
			);
		}
		const renderer = this.#pipeline.manifest.renderers[rendererIndex];
		renderer.clientEntrypoint = entrypoint;

		this.#pipeline.manifest.renderers[rendererIndex] = renderer;
	}

	// NOTE: we keep this private via TS instead via `#` so it's still available on the surface, so we can play with it.
	// @ematipico: I plan to use it for a possible integration that could help people
	private static async createFromManifest(
		manifest: SSRManifest,
	): Promise<experimental_AstroContainer> {
		const astroConfig = await validateConfig(ASTRO_CONFIG_DEFAULTS, process.cwd(), 'container');
		const container = new experimental_AstroContainer({
			manifest,
			astroConfig,
		});
		container.#withManifest = true;
		return container;
	}

	#insertRoute({
		path,
		componentInstance,
		params = {},
		type = 'page',
	}: {
		path: string;
		componentInstance: ComponentInstance;
		route?: string;
		params?: Record<string, string | undefined>;
		type?: RouteType;
	}): RouteData {
		const pathUrl = new URL(path, 'https://example.com');
		const routeData: RouteData = this.#createRoute(pathUrl, params, type);
		this.#pipeline.manifest.routes.push({
			routeData,
			file: '',
			links: [],
			styles: [],
			scripts: [],
		});
		this.#pipeline.insertRoute(routeData, componentInstance);
		return routeData;
	}

	/**
	 * @description
	 * It renders a component and returns the result as a string.
	 *
	 * ## Example
	 *
	 * ```js
	 * import Card from "../src/components/Card.astro";
	 *
	 * const container = await AstroContainer.create();
	 * const result = await container.renderToString(Card);
	 *
	 * console.log(result); // it's a string
	 * ```
	 *
	 *
	 * @param {AstroComponentFactory} component The instance of the component.
	 * @param {ContainerRenderOptions=} options Possible options to pass when rendering the component.
	 */
	public async renderToString(
		component: AstroComponentFactory,
		options: ContainerRenderOptions = {},
	): Promise<string> {
		const response = await this.renderToResponse(component, options);
		return await response.text();
	}

	/**
	 * @description
	 * It renders a component and returns the `Response` as result of the rendering phase.
	 *
	 * ## Example
	 *
	 * ```js
	 * import Card from "../src/components/Card.astro";
	 *
	 * const container = await AstroContainer.create();
	 * const response = await container.renderToResponse(Card);
	 *
	 * console.log(response.status); // it's a number
	 * ```
	 *
	 *
	 * @param {AstroComponentFactory} component The instance of the component.
	 * @param {ContainerRenderOptions=} options Possible options to pass when rendering the component.
	 */
	public async renderToResponse(
		component: AstroComponentFactory,
		options: ContainerRenderOptions = {},
	): Promise<Response> {
		const { routeType = 'page', slots } = options;
		const request = options?.request ?? new Request('https://example.com/');
		const url = new URL(request.url);
		const componentInstance =
			routeType === 'endpoint'
				? (component as unknown as ComponentInstance)
				: this.#wrapComponent(component, options.params);
		const routeData = this.#insertRoute({
			path: request.url,
			componentInstance,
			params: options.params,
			type: routeType,
		});
		const renderContext = await RenderContext.create({
			pipeline: this.#pipeline,
			routeData,
			status: 200,
			request,
			pathname: url.pathname,
			locals: options?.locals ?? {},
			partial: options?.partial ?? true,
			clientAddress: '',
		});
		if (options.params) {
			renderContext.params = options.params;
		}
		if (options.props) {
			renderContext.props = options.props;
		}

		return renderContext.render(componentInstance, slots);
	}

	#createRoute(url: URL, params: Record<string, string | undefined>, type: RouteType): RouteData {
		const segments = removeLeadingForwardSlash(url.pathname)
			.split(posix.sep)
			.filter(Boolean)
			.map((s: string) => {
				validateSegment(s);
				return getParts(s, url.pathname);
			});
		return {
			route: url.pathname,
			component: '',
			generate(_data: any): string {
				return '';
			},
			params: Object.keys(params),
			pattern: getPattern(
				segments,
				ASTRO_CONFIG_DEFAULTS.base,
				ASTRO_CONFIG_DEFAULTS.trailingSlash,
			),
			prerender: false,
			segments,
			type,
			fallbackRoutes: [],
			isIndex: false,
			origin: 'internal',
		};
	}

	/**
	 * If the provided component isn't a default export, the function wraps it in an object `{default: Component }` to mimic the default export.
	 * @param componentFactory
	 * @param params
	 * @private
	 */
	#wrapComponent(
		componentFactory: AstroComponentFactory,
		params?: Record<string, string | undefined>,
	): ComponentInstance {
		if (params) {
			return {
				default: componentFactory,
				getStaticPaths() {
					return [{ params }];
				},
			};
		}
		return { default: componentFactory };
	}
}

function isNamedRenderer(renderer: any): renderer is NamedSSRLoadedRendererValue {
	return !!renderer?.name;
}

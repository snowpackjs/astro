import type { AddressInfo } from 'node:net';
import type { ViteDevServer, InlineConfig as ViteInlineConfig } from 'vite';
import type { SerializedSSRManifest } from '../../core/app/types.js';
import type { PageBuildData } from '../../core/build/types.js';
import type { AstroIntegrationLogger } from '../../core/logger/core.js';
import type { AdapterFeatureStability } from '../../integrations/features-validation.js';
import type { getToolbarServerCommunicationHelpers } from '../../integrations/hooks.js';
import type { DeepPartial } from '../../type-utils.js';
import type { AstroConfig } from './config.js';
import type { RefreshContentOptions } from './content.js';
import type { InternalInjectedRoute, RouteData } from './internal.js';
import type { DevToolbarAppEntry } from './toolbar.js';

export interface RouteOptions {
	/**
	 * The path to this route relative to the project root. The slash is normalized as forward slash
	 * across all OS.
	 * @example "src/pages/blog/[...slug].astro"
	 */
	readonly component: string;
	/**
	 * Whether this route should be prerendered. If the route has an explicit `prerender` export,
	 * the value will be passed here. Otherwise, it's undefined and will fallback to a prerender
	 * default depending on the `output` option.
	 */
	prerender?: boolean;
}

/* Client Directives */
type DirectiveHydrate = () => Promise<void>;
type DirectiveLoad = () => Promise<DirectiveHydrate>;

type DirectiveOptions = {
	/**
	 * The component displayName
	 */
	name: string;
	/**
	 * The attribute value provided
	 */
	value: string;
};

export type ClientDirective = (
	load: DirectiveLoad,
	options: DirectiveOptions,
	el: HTMLElement,
) => void;

export interface ClientDirectiveConfig {
	name: string;
	entrypoint: string | URL;
}

export interface AstroRenderer {
	/** Name of the renderer. */
	name: string;
	/** Import entrypoint for the client/browser renderer. */
	clientEntrypoint?: string | URL;
	/** Import entrypoint for the server/build/ssr renderer. */
	serverEntrypoint: string | URL;
}

export type AdapterSupportsKind =
	(typeof AdapterFeatureStability)[keyof typeof AdapterFeatureStability];

export type AdapterSupportWithMessage = {
	support: Exclude<AdapterSupportsKind, 'stable'>;
	message: string;
};

export type AdapterSupport = AdapterSupportsKind | AdapterSupportWithMessage;

export interface AstroAdapterFeatures {
	/**
	 * Creates an edge function that will communicate with the Astro middleware
	 */
	edgeMiddleware: boolean;
	/**
	 * Determine the type of build output the adapter is intended for. Defaults to `server`;
	 */
	buildOutput?: 'static' | 'server';
}

export interface AstroAdapter {
	name: string;
	serverEntrypoint?: string | URL;
	previewEntrypoint?: string | URL;
	exports?: string[];
	args?: any;
	adapterFeatures?: AstroAdapterFeatures;
	/**
	 * List of features supported by an adapter.
	 *
	 * If the adapter is not able to handle certain configurations, Astro will throw an error.
	 */
	supportedAstroFeatures: AstroAdapterFeatureMap;
}

export type AstroAdapterFeatureMap = {
	/**
	 * The adapter is able serve static pages
	 */
	staticOutput?: AdapterSupport;

	/**
	 * The adapter is able to serve pages that are static or rendered via server
	 */
	hybridOutput?: AdapterSupport;

	/**
	 * The adapter is able to serve SSR pages
	 */
	serverOutput?: AdapterSupport;

	/**
	 * The adapter is able to support i18n domains
	 */
	i18nDomains?: AdapterSupport;

	/**
	 * The adapter is able to support `getSecret` exported from `astro:env/server`
	 */
	envGetSecret?: AdapterSupport;

	/**
	 * The adapter supports image transformation using the built-in Sharp image service
	 */
	sharpImageService?: AdapterSupport;
};

/**
 * IDs for different stages of JS script injection:
 * - "before-hydration": Imported client-side, before the hydration script runs. Processed & resolved by Vite.
 * - "head-inline": Injected into a script tag in the `<head>` of every page. Not processed or resolved by Vite.
 * - "page": Injected into the JavaScript bundle of every page. Processed & resolved by Vite.
 * - "page-ssr": Injected into the frontmatter of every Astro page. Processed & resolved by Vite.
 */
export type InjectedScriptStage = 'before-hydration' | 'head-inline' | 'page' | 'page-ssr';

export type InjectedRoute = Omit<InternalInjectedRoute, 'origin'>;

export interface InjectedType {
	filename: string;
	content: string;
}

export type AstroIntegrationMiddleware = {
	order: 'pre' | 'post';
	entrypoint: string | URL;
};

export type HookParameters<
	Hook extends keyof AstroIntegration['hooks'],
	Fn = AstroIntegration['hooks'][Hook],
> = Fn extends (...args: any) => any ? Parameters<Fn>[0] : never;

export interface BaseIntegrationHooks {
	'astro:config:setup': (options: {
		config: AstroConfig;
		command: 'dev' | 'build' | 'preview' | 'sync';
		isRestart: boolean;
		updateConfig: (newConfig: DeepPartial<AstroConfig>) => AstroConfig;
		addRenderer: (renderer: AstroRenderer) => void;
		addWatchFile: (path: URL | string) => void;
		injectScript: (stage: InjectedScriptStage, content: string) => void;
		injectRoute: (injectRoute: InjectedRoute) => void;
		addClientDirective: (directive: ClientDirectiveConfig) => void;
		addDevToolbarApp: (entrypoint: DevToolbarAppEntry) => void;
		addMiddleware: (mid: AstroIntegrationMiddleware) => void;
		createCodegenDir: () => URL;
		logger: AstroIntegrationLogger;
	}) => void | Promise<void>;
	'astro:config:done': (options: {
		config: AstroConfig;
		setAdapter: (adapter: AstroAdapter) => void;
		injectTypes: (injectedType: InjectedType) => URL;
		logger: AstroIntegrationLogger;
		buildOutput: 'static' | 'server';
	}) => void | Promise<void>;
	'astro:server:setup': (options: {
		server: ViteDevServer;
		logger: AstroIntegrationLogger;
		toolbar: ReturnType<typeof getToolbarServerCommunicationHelpers>;
		refreshContent?: (options: RefreshContentOptions) => Promise<void>;
	}) => void | Promise<void>;
	'astro:server:start': (options: {
		address: AddressInfo;
		logger: AstroIntegrationLogger;
	}) => void | Promise<void>;
	'astro:server:done': (options: { logger: AstroIntegrationLogger }) => void | Promise<void>;
	'astro:build:ssr': (options: {
		manifest: SerializedSSRManifest;
		/**
		 * This maps a {@link RouteData} to an {@link URL}, this URL represents
		 * the physical file you should import.
		 */
		entryPoints: Map<IntegrationRouteData, URL>;
		/**
		 * File path of the emitted middleware
		 */
		middlewareEntryPoint: URL | undefined;
		logger: AstroIntegrationLogger;
	}) => void | Promise<void>;
	'astro:build:start': (options: { logger: AstroIntegrationLogger }) => void | Promise<void>;
	'astro:build:setup': (options: {
		vite: ViteInlineConfig;
		pages: Map<string, PageBuildData>;
		target: 'client' | 'server';
		updateConfig: (newConfig: ViteInlineConfig) => void;
		logger: AstroIntegrationLogger;
	}) => void | Promise<void>;
	'astro:build:generated': (options: {
		dir: URL;
		logger: AstroIntegrationLogger;
	}) => void | Promise<void>;
	'astro:build:done': (options: {
		pages: { pathname: string }[];
		dir: URL;
		/** @deprecated Use the `assets` map and the new `astro:routes:resolved` hook */
		routes: IntegrationRouteData[];
		assets: Map<string, URL[]>;
		logger: AstroIntegrationLogger;
	}) => void | Promise<void>;
	'astro:route:setup': (options: {
		route: RouteOptions;
		logger: AstroIntegrationLogger;
	}) => void | Promise<void>;
	'astro:routes:resolved': (options: {
		routes: IntegrationResolvedRoute[];
		logger: AstroIntegrationLogger;
	}) => void | Promise<void>;
}

export interface AstroIntegration {
	/** The name of the integration. */
	name: string;
	/** The different hooks available to extend. */
	hooks: {
		[K in keyof Astro.IntegrationHooks]?: Astro.IntegrationHooks[K];
	} & Partial<Record<string, unknown>>;
}

/**
 * A smaller version of the {@link RouteData} that is used in the integrations.
 * @deprecated Use {@link IntegrationResolvedRoute}
 */
export type IntegrationRouteData = Omit<
	RouteData,
	'isIndex' | 'fallbackRoutes' | 'redirectRoute' | 'origin'
> & {
	/**
	 * {@link RouteData.redirectRoute}
	 */
	redirectRoute?: IntegrationRouteData;
};

export interface IntegrationResolvedRoute
	extends Pick<
		RouteData,
		'generate' | 'params' | 'pathname' | 'segments' | 'type' | 'redirect' | 'origin'
	> {
	/**
	 * {@link RouteData.route}
	 */
	pattern: RouteData['route'];

	/**
	 * {@link RouteData.pattern}
	 */
	patternRegex: RouteData['pattern'];

	/**
	 * {@link RouteData.component}
	 */
	entrypoint: RouteData['component'];

	/**
	 * {@link RouteData.prerender}
	 */
	isPrerendered: RouteData['prerender'];

	/**
	 * {@link RouteData.redirectRoute}
	 */
	redirectRoute?: IntegrationResolvedRoute;
}

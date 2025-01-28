import type { SSRManifest } from '../core/app/types.js';
import type { AstroTimer } from '../core/config/timer.js';
import type { TSConfig } from '../core/config/tsconfig.js';
import type { Logger } from '../core/logger/core.js';
import type { AstroPreferences } from '../preferences/index.js';
import type { AstroComponentFactory } from '../runtime/server/index.js';
import type { GetStaticPathsOptions, GetStaticPathsResult } from './public/common.js';
import type { AstroConfig } from './public/config.js';
import type { ContentEntryType, DataEntryType } from './public/content.js';
import type {
	AstroAdapter,
	AstroRenderer,
	InjectedScriptStage,
	InjectedType,
} from './public/integrations.js';
import type { InternalInjectedRoute, ResolvedInjectedRoute, RouteData } from './public/internal.js';
import type { DevToolbarAppEntry } from './public/toolbar.js';

export type SerializedRouteData = Omit<
	RouteData,
	'generate' | 'pattern' | 'redirectRoute' | 'fallbackRoutes'
> & {
	generate: undefined;
	pattern: string;
	redirectRoute: SerializedRouteData | undefined;
	fallbackRoutes: SerializedRouteData[];
	_meta: {
		trailingSlash: AstroConfig['trailingSlash'];
	};
};

export interface AstroSettings {
	config: AstroConfig;
	adapter: AstroAdapter | undefined;
	preferences: AstroPreferences;
	injectedRoutes: InternalInjectedRoute[];
	resolvedInjectedRoutes: ResolvedInjectedRoute[];
	pageExtensions: string[];
	contentEntryTypes: ContentEntryType[];
	dataEntryTypes: DataEntryType[];
	renderers: AstroRenderer[];
	scripts: {
		stage: InjectedScriptStage;
		content: string;
	}[];
	/**
	 * Map of directive name (e.g. `load`) to the directive script code
	 */
	clientDirectives: Map<string, string>;
	devToolbarApps: (DevToolbarAppEntry | string)[];
	middlewares: { pre: string[]; post: string[] };
	tsConfig: TSConfig | undefined;
	tsConfigPath: string | undefined;
	watchFiles: string[];
	timer: AstroTimer;
	dotAstroDir: URL;
	/**
	 * Latest version of Astro, will be undefined if:
	 * - unable to check
	 * - the user has disabled the check
	 * - the check has not completed yet
	 * - the user is on the latest version already
	 */
	latestAstroVersion: string | undefined;
	serverIslandMap: NonNullable<SSRManifest['serverIslandMap']>;
	serverIslandNameMap: NonNullable<SSRManifest['serverIslandNameMap']>;
	// This makes content optional. Internal only so it's not optional on InjectedType
	injectedTypes: Array<Omit<InjectedType, 'content'> & Partial<Pick<InjectedType, 'content'>>>;
	/**
	 * Determine if the build output should be a static, dist folder or a adapter-based server output
	 * undefined when unknown
	 */
	buildOutput: undefined | 'static' | 'server';
}

/** Generic interface for a component (Astro, Svelte, React, etc.) */
export interface ComponentInstance {
	default: AstroComponentFactory;
	css?: string[];
	partial?: boolean;
	prerender?: boolean;
	getStaticPaths?: (options: GetStaticPathsOptions) => GetStaticPathsResult;
}

export interface RoutesList {
	routes: RouteData[];
}

export interface AstroPluginOptions {
	settings: AstroSettings;
	logger: Logger;
}

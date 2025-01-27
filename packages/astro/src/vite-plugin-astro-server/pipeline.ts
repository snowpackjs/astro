import { fileURLToPath } from 'node:url';
import { getInfoOutput } from '../cli/info/index.js';
import type { HeadElements, TryRewriteResult } from '../core/base-pipeline.js';
import { ASTRO_VERSION } from '../core/constants.js';
import { enhanceViteSSRError } from '../core/errors/dev/index.js';
import { AggregateError, CSSError, MarkdownError } from '../core/errors/index.js';
import type { Logger } from '../core/logger/core.js';
import type { ModuleLoader } from '../core/module-loader/index.js';
import { Pipeline, loadRenderer } from '../core/render/index.js';
import { createDefaultRoutes } from '../core/routing/default.js';
import { findRouteToRewrite } from '../core/routing/rewrite.js';
import { isPage, viteID } from '../core/util.js';
import { resolveIdToUrl } from '../core/viteUtils.js';
import type { AstroSettings, ComponentInstance, ManifestData } from '../types/astro.js';
import type { RewritePayload } from '../types/public/common.js';
import type {
	RouteData,
	SSRElement,
	SSRLoadedRenderer,
	SSRManifest,
} from '../types/public/internal.js';
import type { DevToolbarMetadata } from '../types/public/toolbar.js';
import { PAGE_SCRIPT_ID } from '../vite-plugin-scripts/index.js';
import { getStylesForURL } from './css.js';
import { getComponentMetadata } from './metadata.js';
import { createResolve } from './resolve.js';

export class DevPipeline extends Pipeline {
	// renderers are loaded on every request,
	// so it needs to be mutable here unlike in other environments
	override renderers = new Array<SSRLoadedRenderer>();

	manifestData: ManifestData | undefined;

	componentInterner: WeakMap<RouteData, ComponentInstance> = new WeakMap<
		RouteData,
		ComponentInstance
	>();

	private constructor(
		readonly loader: ModuleLoader,
		readonly logger: Logger,
		readonly manifest: SSRManifest,
		readonly settings: AstroSettings,
		readonly config = settings.config,
		readonly defaultRoutes = createDefaultRoutes(manifest),
	) {
		const resolve = createResolve(loader, config.root);
		const serverLike = settings.buildOutput === 'server';
		const streaming = true;
		super(logger, manifest, 'development', [], resolve, serverLike, streaming);
		manifest.serverIslandMap = settings.serverIslandMap;
		manifest.serverIslandNameMap = settings.serverIslandNameMap;
	}

	static create(
		manifestData: ManifestData,
		{
			loader,
			logger,
			manifest,
			settings,
		}: Pick<DevPipeline, 'loader' | 'logger' | 'manifest' | 'settings'>,
	) {
		const pipeline = new DevPipeline(loader, logger, manifest, settings);
		pipeline.manifestData = manifestData;
		return pipeline;
	}

	async headElements(routeData: RouteData): Promise<HeadElements> {
		const {
			config: { root },
			loader,
			runtimeMode,
			settings,
		} = this;
		const filePath = new URL(`${routeData.component}`, root);
		const scripts = new Set<SSRElement>();

		// Inject HMR scripts
		if (isPage(filePath, settings) && runtimeMode === 'development') {
			scripts.add({
				props: { type: 'module', src: '/@vite/client' },
				children: '',
			});

			if (
				settings.config.devToolbar.enabled &&
				(await settings.preferences.get('devToolbar.enabled'))
			) {
				const src = await resolveIdToUrl(loader, 'astro/runtime/client/dev-toolbar/entrypoint.js');
				scripts.add({ props: { type: 'module', src }, children: '' });

				const additionalMetadata: DevToolbarMetadata['__astro_dev_toolbar__'] = {
					root: fileURLToPath(settings.config.root),
					version: ASTRO_VERSION,
					latestAstroVersion: settings.latestAstroVersion,
					debugInfo: await getInfoOutput({ userConfig: settings.config, print: false }),
				};

				// Additional data for the dev overlay
				const children = `window.__astro_dev_toolbar__ = ${JSON.stringify(additionalMetadata)}`;
				scripts.add({ props: {}, children });
			}
		}

		// TODO: We should allow adding generic HTML elements to the head, not just scripts
		for (const script of settings.scripts) {
			if (script.stage === 'head-inline') {
				scripts.add({
					props: {},
					children: script.content,
				});
			} else if (script.stage === 'page' && isPage(filePath, settings)) {
				scripts.add({
					props: { type: 'module', src: `/@id/${PAGE_SCRIPT_ID}` },
					children: '',
				});
			}
		}

		// Pass framework CSS in as style tags to be appended to the page.
		const links = new Set<SSRElement>();
		const { urls, styles: _styles } = await getStylesForURL(filePath, loader);
		for (const href of urls) {
			links.add({ props: { rel: 'stylesheet', href }, children: '' });
		}

		const styles = new Set<SSRElement>();
		for (const { id, url: src, content } of _styles) {
			// Vite handles HMR for styles injected as scripts
			scripts.add({ props: { type: 'module', src }, children: '' });
			// But we still want to inject the styles to avoid FOUC. The style tags
			// should emulate what Vite injects so further HMR works as expected.
			styles.add({ props: { 'data-vite-dev-id': id }, children: content });
		}

		return { scripts, styles, links };
	}

	componentMetadata(routeData: RouteData) {
		const {
			config: { root },
			loader,
		} = this;
		const filePath = new URL(`${routeData.component}`, root);
		return getComponentMetadata(filePath, loader);
	}

	async preload(routeData: RouteData, filePath: URL) {
		const { loader } = this;

		// First check built-in routes
		for (const route of this.defaultRoutes) {
			if (route.matchesComponent(filePath)) {
				return route.instance;
			}
		}

		// Important: This needs to happen first, in case a renderer provides polyfills.
		const renderers__ = this.settings.renderers.map((r) => loadRenderer(r, loader));
		const renderers_ = await Promise.all(renderers__);
		this.renderers = renderers_.filter((r): r is SSRLoadedRenderer => Boolean(r));

		try {
			// Load the module from the Vite SSR Runtime.
			const componentInstance = (await loader.import(viteID(filePath))) as ComponentInstance;
			this.componentInterner.set(routeData, componentInstance);
			return componentInstance;
		} catch (error) {
			// If the error came from Markdown or CSS, we already handled it and there's no need to enhance it
			if (MarkdownError.is(error) || CSSError.is(error) || AggregateError.is(error)) {
				throw error;
			}

			throw enhanceViteSSRError({ error, filePath, loader });
		}
	}

	clearRouteCache() {
		this.routeCache.clearAll();
		this.componentInterner = new WeakMap<RouteData, ComponentInstance>();
	}

	async getComponentByRoute(routeData: RouteData): Promise<ComponentInstance> {
		const component = this.componentInterner.get(routeData);
		if (component) {
			return component;
		} else {
			const filePath = new URL(`${routeData.component}`, this.config.root);
			return await this.preload(routeData, filePath);
		}
	}

	async tryRewrite(payload: RewritePayload, request: Request): Promise<TryRewriteResult> {
		if (!this.manifestData) {
			throw new Error('Missing manifest data. This is an internal error, please file an issue.');
		}
		const { routeData, pathname, newUrl } = findRouteToRewrite({
			payload,
			request,
			routes: this.manifestData?.routes,
			trailingSlash: this.config.trailingSlash,
			buildFormat: this.config.build.format,
			base: this.config.base,
		});

		const componentInstance = await this.getComponentByRoute(routeData);
		return { newUrl, pathname, componentInstance, routeData };
	}

	setManifestData(manifestData: ManifestData) {
		this.manifestData = manifestData;
	}

	rewriteKnownRoute(route: string, sourceRoute: RouteData): ComponentInstance {
		if (this.serverLike && sourceRoute.prerender) {
			for (let def of this.defaultRoutes) {
				if (route === def.route) {
					return def.instance;
				}
			}
		}

		throw new Error('Unknown route');
	}
}

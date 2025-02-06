import type { ComponentInstance, RoutesList } from '../../types/astro.js';
import type { RewritePayload } from '../../types/public/common.js';
import type { RouteData, SSRElement, SSRResult } from '../../types/public/internal.js';
import { Pipeline, type TryRewriteResult } from '../base-pipeline.js';
import type { SinglePageBuiltModule } from '../build/types.js';
import { RedirectSinglePageBuiltModule } from '../redirects/component.js';
import { createModuleScriptElement, createStylesheetElementSet } from '../render/ssr-element.js';
import { findRouteToRewrite } from '../routing/rewrite.js';

export class AppPipeline extends Pipeline {
	#manifestData: RoutesList | undefined;

	static create(
		manifestData: RoutesList,
		{
			logger,
			manifest,
			runtimeMode,
			renderers,
			resolve,
			serverLike,
			streaming,
			defaultRoutes,
		}: Pick<
			AppPipeline,
			| 'logger'
			| 'manifest'
			| 'runtimeMode'
			| 'renderers'
			| 'resolve'
			| 'serverLike'
			| 'streaming'
			| 'defaultRoutes'
		>,
	) {
		const pipeline = new AppPipeline(
			logger,
			manifest,
			runtimeMode,
			renderers,
			resolve,
			serverLike,
			streaming,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			defaultRoutes,
		);
		pipeline.#manifestData = manifestData;
		return pipeline;
	}

	headElements(routeData: RouteData): Pick<SSRResult, 'scripts' | 'styles' | 'links'> {
		const routeInfo = this.manifest.routes.find((route) => route.routeData === routeData);
		// may be used in the future for handling rel=modulepreload, rel=icon, rel=manifest etc.
		const links = new Set<never>();
		const scripts = new Set<SSRElement>();
		const styles = createStylesheetElementSet(routeInfo?.styles ?? []);

		for (const script of routeInfo?.scripts ?? []) {
			if ('stage' in script) {
				if (script.stage === 'head-inline') {
					scripts.add({
						props: {},
						children: script.children,
					});
				}
			} else {
				scripts.add(createModuleScriptElement(script));
			}
		}
		return { links, styles, scripts };
	}

	componentMetadata() {}

	async getComponentByRoute(routeData: RouteData): Promise<ComponentInstance> {
		const module = await this.getModuleForRoute(routeData);
		return module.page();
	}

	async tryRewrite(payload: RewritePayload, request: Request): Promise<TryRewriteResult> {
		const { newUrl, pathname, routeData } = findRouteToRewrite({
			payload,
			request,
			routes: this.manifest?.routes.map((r) => r.routeData),
			trailingSlash: this.manifest.trailingSlash,
			buildFormat: this.manifest.buildFormat,
			base: this.manifest.base,
		});

		const componentInstance = await this.getComponentByRoute(routeData);
		return { newUrl, pathname, componentInstance, routeData };
	}

	async getModuleForRoute(route: RouteData): Promise<SinglePageBuiltModule> {
		for (const defaultRoute of this.defaultRoutes) {
			if (route.component === defaultRoute.component) {
				return {
					page: () => Promise.resolve(defaultRoute.instance),
					renderers: [],
				};
			}
		}

		if (route.type === 'redirect') {
			return RedirectSinglePageBuiltModule;
		} else {
			if (this.manifest.pageMap) {
				const importComponentInstance = this.manifest.pageMap.get(route.component);
				if (!importComponentInstance) {
					throw new Error(
						`Unexpectedly unable to find a component instance for route ${route.route}`,
					);
				}
				return await importComponentInstance();
			} else if (this.manifest.pageModule) {
				return this.manifest.pageModule;
			}
			throw new Error(
				"Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue.",
			);
		}
	}
}

import type { AstroSettings, RoutesList } from '../../types/astro.js';
import type { Logger } from '../logger/core.js';
import type { AllPagesData } from './types.js';

import * as colors from 'kleur/colors';
import { debug } from '../logger/core.js';
import { DEFAULT_COMPONENTS } from '../routing/default.js';
import { makePageDataKey } from './plugins/util.js';

export interface CollectPagesDataOptions {
	settings: AstroSettings;
	logger: Logger;
	manifest: RoutesList;
}

export interface CollectPagesDataResult {
	assets: Record<string, string>;
	allPages: AllPagesData;
}

// Examines the routes and returns a collection of information about each page.
export function collectPagesData(opts: CollectPagesDataOptions): CollectPagesDataResult {
	const { settings, manifest } = opts;

	const assets: Record<string, string> = {};
	const allPages: AllPagesData = {};

	// Collect all routes ahead-of-time, before we start the build.
	// NOTE: This enforces that `getStaticPaths()` is only called once per route,
	// and is then cached across all future SSR builds. In the past, we've had trouble
	// with parallelized builds without guaranteeing that this is called first.
	for (const route of manifest.routes) {
		// There's special handling in SSR
		if (DEFAULT_COMPONENTS.some((component) => route.component === component)) {
			continue;
		}

		// Generate a unique key to identify each page in the build process.
		const key = makePageDataKey(route.route, route.component);
		// static route:
		if (route.pathname) {
			allPages[key] = {
				key: key,
				component: route.component,
				route,
				moduleSpecifier: '',
				styles: [],
			};

			if (settings.buildOutput === 'static') {
				const html = `${route.pathname}`.replace(/\/?$/, '/index.html');
				debug(
					'build',
					`├── ${colors.bold(colors.green('✔'))} ${route.component} → ${colors.yellow(html)}`,
				);
			} else {
				debug('build', `├── ${colors.bold(colors.green('✔'))} ${route.component}`);
			}
			continue;
		}
		// dynamic route:
		allPages[key] = {
			key: key,
			component: route.component,
			route,
			moduleSpecifier: '',
			styles: [],
		};
	}

	return { assets, allPages };
}

import { runHookRouteSetup } from '../../../integrations/hooks.js';
import { getPrerenderDefault } from '../../../prerender/utils.js';
import type { AstroSettings } from '../../../types/astro.js';
import type { RouteData } from '../../../types/public/internal.js';
import type { Logger } from '../../logger/core.js';

const PRERENDER_REGEX = /^\s*export\s+const\s+prerender\s*=\s*(true|false);?/m;

export async function getRoutePrerenderOption(
	content: string,
	route: RouteData,
	settings: AstroSettings,
	logger: Logger,
) {
	// Check if the route is pre-rendered or not
	const match = PRERENDER_REGEX.exec(content);
	if (match) {
		route.prerender = match[1] === 'true';
	}

	await runHookRouteSetup({ route, settings, logger });

	// If not explicitly set, default to the global setting
	if (typeof route.prerender === undefined) {
		route.prerender = getPrerenderDefault(settings.config);
	}

	if (!route.prerender) settings.buildOutput = 'server';
}

import {
	removeLeadingForwardSlash,
	removeTrailingForwardSlash,
} from '@astrojs/internal-helpers/path';
import { resolveInjectedRoute } from '../../core/routing/manifest/create.js';
import { getPattern } from '../../core/routing/manifest/pattern.js';
import type { AstroSettings, RoutesList } from '../../types/astro.js';
import type { RouteData } from '../../types/public/internal.js';

export function injectImageEndpoint(
	settings: AstroSettings,
	manifest: RoutesList,
	mode: 'dev' | 'build',
	cwd?: string,
) {
	manifest.routes.unshift(getImageEndpointData(settings, mode, cwd));
}

function getImageEndpointData(
	settings: AstroSettings,
	mode: 'dev' | 'build',
	cwd?: string,
): RouteData {
	const endpointEntrypoint =
		settings.config.image.endpoint.entrypoint === undefined // If not set, use default endpoint
			? mode === 'dev'
				? 'astro/assets/endpoint/node'
				: 'astro/assets/endpoint/generic'
			: settings.config.image.endpoint.entrypoint;

	const segments = [
		[
			{
				content: removeTrailingForwardSlash(
					removeLeadingForwardSlash(settings.config.image.endpoint.route),
				),
				dynamic: false,
				spread: false,
			},
		],
	];

	return {
		type: 'endpoint',
		isIndex: false,
		route: settings.config.image.endpoint.route,
		pattern: getPattern(segments, settings.config.base, settings.config.trailingSlash),
		segments,
		params: [],
		component: resolveInjectedRoute(endpointEntrypoint, settings.config.root, cwd).component,
		generate: () => '',
		pathname: settings.config.image.endpoint.route,
		prerender: false,
		fallbackRoutes: [],
		origin: 'internal',
	};
}

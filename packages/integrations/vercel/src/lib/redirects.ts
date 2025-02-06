import nodePath from 'node:path';
import { removeLeadingForwardSlash } from '@astrojs/internal-helpers/path';
import type { AstroConfig, IntegrationResolvedRoute, RoutePart } from 'astro';

import type { Redirect } from '@vercel/routing-utils';

const pathJoin = nodePath.posix.join;

// Copied from astro/packages/astro/src/core/routing/manifest/create.ts
// Disable eslint as we're not sure how to improve this regex yet
// eslint-disable-next-line regexp/no-super-linear-backtracking
const ROUTE_DYNAMIC_SPLIT = /\[(.+?\(.+?\)|.+?)\]/;
const ROUTE_SPREAD = /^\.{3}.+$/;
function getParts(part: string, file: string) {
	const result: RoutePart[] = [];
	part.split(ROUTE_DYNAMIC_SPLIT).map((str, i) => {
		if (!str) return;
		const dynamic = i % 2 === 1;

		const [, content] = dynamic ? /([^(]+)$/.exec(str) || [null, null] : [null, str];

		if (!content || (dynamic && !/^(?:\.\.\.)?[\w$]+$/.test(content))) {
			throw new Error(`Invalid route ${file} — parameter name must match /^[a-zA-Z0-9_$]+$/`);
		}

		result.push({
			content,
			dynamic,
			spread: dynamic && ROUTE_SPREAD.test(content),
		});
	});

	return result;
}
/**
 * Convert Astro routes into Vercel path-to-regexp syntax, which are the input for getTransformedRoutes
 */
function getMatchPattern(segments: RoutePart[][]) {
	return segments
		.map((segment) => {
			return segment
				.map((part) => {
					if (part.spread) {
						// Extract parameter name from spread syntax (e.g., "...slug" -> "slug")
						const paramName = part.content.startsWith('...') ? part.content.slice(3) : part.content;
						return `:${paramName}*`;
					}
					if (part.dynamic) {
						return `:${part.content}`;
					}
					return part.content;
				})
				.join('');
		})
		.join('/');
}

// Copied from /home/juanm04/dev/misc/astro/packages/astro/src/core/routing/manifest/create.ts
// 2022-04-26
function getMatchRegex(segments: RoutePart[][]) {
	return segments
		.map((segment, segmentIndex) => {
			return segment.length === 1 && segment[0].spread
				? '(?:\\/(.*?))?'
				: // Omit leading slash if segment is a spread.
					// This is handled using a regex in Astro core.
					// To avoid complex data massaging, we handle in-place here.
					(segmentIndex === 0 ? '' : '/') +
						segment
							.map((part) => {
								if (part)
									return part.spread
										? '(.*?)'
										: part.dynamic
											? '([^/]+?)'
											: part.content
													.normalize()
													.replace(/\?/g, '%3F')
													.replace(/#/g, '%23')
													.replace(/%5B/g, '[')
													.replace(/%5D/g, ']')
													.replace(/[*+?^${}()|[\]\\]/g, '\\$&');
							})
							.join('');
		})
		.join('');
}

function getRedirectLocation(route: IntegrationResolvedRoute, config: AstroConfig): string {
	if (route.redirectRoute) {
		const pattern = getMatchPattern(route.redirectRoute.segments);
		return pathJoin(config.base, pattern);
	}

	if (typeof route.redirect === 'object') {
		return pathJoin(config.base, route.redirect.destination);
	}
	return pathJoin(config.base, route.redirect || '');
}

function getRedirectStatus(route: IntegrationResolvedRoute): number {
	if (typeof route.redirect === 'object') {
		return route.redirect.status;
	}
	return 301;
}

export function escapeRegex(content: string) {
	const segments = removeLeadingForwardSlash(content)
		.split(nodePath.posix.sep)
		.filter(Boolean)
		.map((s: string) => {
			return getParts(s, content);
		});
	return `^/${getMatchRegex(segments)}$`;
}

export function getRedirects(routes: IntegrationResolvedRoute[], config: AstroConfig): Redirect[] {
	const redirects: Redirect[] = [];

	for (const route of routes) {
		if (route.type === 'redirect') {
			redirects.push({
				source: config.base + getMatchPattern(route.segments),
				destination: getRedirectLocation(route, config),
				statusCode: getRedirectStatus(route),
			});
		}
	}
	return redirects;
}

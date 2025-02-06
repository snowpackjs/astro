import type { AstroConfig } from '../../../types/public/config.js';
import type { RoutePart } from '../../../types/public/internal.js';

/**
 * Sanitizes the parameters object by normalizing string values and replacing certain characters with their URL-encoded equivalents.
 * @param {Record<string, string | number>} params - The parameters object to be sanitized.
 * @returns {Record<string, string | number>} The sanitized parameters object.
 */
function sanitizeParams(params: Record<string, string | number>): Record<string, string | number> {
	return Object.fromEntries(
		Object.entries(params).map(([key, value]) => {
			if (typeof value === 'string') {
				return [key, value.normalize().replace(/#/g, '%23').replace(/\?/g, '%3F')];
			}
			return [key, value];
		}),
	);
}

function getParameter(part: RoutePart, params: Record<string, string | number>): string | number {
	if (part.spread) {
		return params[part.content.slice(3)] || '';
	}

	if (part.dynamic) {
		if (!params[part.content]) {
			throw new TypeError(`Missing parameter: ${part.content}`);
		}

		return params[part.content];
	}

	return part.content
		.normalize()
		.replace(/\?/g, '%3F')
		.replace(/#/g, '%23')
		.replace(/%5B/g, '[')
		.replace(/%5D/g, ']');
}

function getSegment(segment: RoutePart[], params: Record<string, string | number>): string {
	const segmentPath = segment.map((part) => getParameter(part, params)).join('');

	return segmentPath ? '/' + segmentPath : '';
}

export function getRouteGenerator(
	segments: RoutePart[][],
	addTrailingSlash: AstroConfig['trailingSlash'],
) {
	return (params: Record<string, string | number>): string => {
		const sanitizedParams = sanitizeParams(params);

		// Unless trailingSlash config is set to 'always', don't automatically append it.
		let trailing: '/' | '' = '';
		if (addTrailingSlash === 'always' && segments.length) {
			trailing = '/';
		}

		const path =
			segments.map((segment) => getSegment(segment, sanitizedParams)).join('') + trailing;

		return path || '/';
	};
}

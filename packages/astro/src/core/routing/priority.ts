import type { RouteData } from '../../types/public/internal.js';

/**
 * Comparator for sorting routes in resolution order.
 *
 * The routes are sorted in by the following rules in order, following the first rule that
 * applies:
 * - More specific routes are sorted before less specific routes. Here, "specific" means
 *   the number of segments in the route, so a parent route is always sorted after its children.
 *   For example, `/foo/bar` is sorted before `/foo`.
 *   Index routes, originating from a file named `index.astro`, are considered to have one more
 *   segment than the URL they represent.
 * - Static routes are sorted before dynamic routes.
 *   For example, `/foo/bar` is sorted before `/foo/[bar]`.
 * - Dynamic routes with single parameters are sorted before dynamic routes with rest parameters.
 *   For example, `/foo/[bar]` is sorted before `/foo/[...bar]`.
 * - Prerendered routes are sorted before non-prerendered routes.
 * - Endpoints are sorted before pages.
 *   For example, a file `/foo.ts` is sorted before `/bar.astro`.
 * - If both routes are equal regarding all previous conditions, they are sorted alphabetically.
 *   For example, `/bar` is sorted before `/foo`.
 *   The definition of "alphabetically" is dependent on the default locale of the running system.
 */
export function routeComparator(a: RouteData, b: RouteData) {
	const commonLength = Math.min(a.segments.length, b.segments.length);

	for (let index = 0; index < commonLength; index++) {
		const aSegment = a.segments[index];
		const bSegment = b.segments[index];

		const aIsStatic = aSegment.every((part) => !part.dynamic && !part.spread);
		const bIsStatic = bSegment.every((part) => !part.dynamic && !part.spread);

		if (aIsStatic && bIsStatic) {
			// Both segments are static, they are sorted alphabetically if they are different
			const aContent = aSegment.map((part) => part.content).join('');
			const bContent = bSegment.map((part) => part.content).join('');

			if (aContent !== bContent) {
				return aContent.localeCompare(bContent);
			}
		}

		// Sort static routes before dynamic routes
		if (aIsStatic !== bIsStatic) {
			return aIsStatic ? -1 : 1;
		}

		const aAllDynamic = aSegment.every((part) => part.dynamic);
		const bAllDynamic = bSegment.every((part) => part.dynamic);

		// Some route might have partial dynamic segments, e.g. game-[title].astro
		// These routes should have higher priority against route that have **only** dynamic segments, e.g. [title].astro
		if (aAllDynamic !== bAllDynamic) {
			return aAllDynamic ? 1 : -1;
		}

		const aHasSpread = aSegment.some((part) => part.spread);
		const bHasSpread = bSegment.some((part) => part.spread);

		// Sort dynamic routes with rest parameters after dynamic routes with single parameters
		// (also after static, but that is already covered by the previous condition)
		if (aHasSpread !== bHasSpread) {
			return aHasSpread ? 1 : -1;
		}
	}

	const aLength = a.segments.length;
	const bLength = b.segments.length;

	if (aLength !== bLength) {
		const aEndsInRest = a.segments.at(-1)?.some((part) => part.spread);
		const bEndsInRest = b.segments.at(-1)?.some((part) => part.spread);

		if (aEndsInRest !== bEndsInRest && Math.abs(aLength - bLength) === 1) {
			// If only one of the routes ends in a rest parameter
			// and the difference in length is exactly 1
			// and the shorter route is the one that ends in a rest parameter
			// the shorter route is considered more specific.
			// I.e. `/foo` is considered more specific than `/foo/[...bar]`
			if (aLength > bLength && aEndsInRest) {
				// b: /foo
				// a: /foo/[...bar]
				return 1;
			}

			if (bLength > aLength && bEndsInRest) {
				// a: /foo
				// b: /foo/[...bar]
				return -1;
			}
		}

		// Sort routes by length
		return aLength > bLength ? -1 : 1;
	}

	// Sort endpoints before pages
	if ((a.type === 'endpoint') !== (b.type === 'endpoint')) {
		return a.type === 'endpoint' ? -1 : 1;
	}

	// Both routes have segments with the same properties
	return a.route.localeCompare(b.route);
}

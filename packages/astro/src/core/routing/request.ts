/**
 * Utilities for extracting information from `Request`
 */

// Parses multiple header and returns first value if available.
export function getFirstForwardedValue(multiValueHeader?: string | string[] | null) {
	return multiValueHeader
		?.toString()
		?.split(',')
		.map((e) => e.trim())?.[0];
}

/**
 * Returns the first value associated to the `x-forwarded-for` header.
 *
 * @param {Request} request
 */
export function getClientIpAddress(request: Request): string | undefined {
	return getFirstForwardedValue(request.headers.get('x-forwarded-for'));
}

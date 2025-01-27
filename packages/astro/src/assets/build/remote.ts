import CachePolicy from 'http-cache-semantics';

export type RemoteCacheEntry = {
	data?: string;
	expires: number;
	etag?: string;
	lastModified?: string;
};

export async function loadRemoteImage(src: string) {
	const req = new Request(src);
	const res = await fetch(req);

	if (!res.ok) {
		throw new Error(
			`Failed to load remote image ${src}. The request did not return a 200 OK response. (received ${res.status}))`,
		);
	}

	// calculate an expiration date based on the response's TTL
	const policy = new CachePolicy(webToCachePolicyRequest(req), webToCachePolicyResponse(res));
	const expires = policy.storable() ? policy.timeToLive() : 0;

	return {
		data: Buffer.from(await res.arrayBuffer()),
		expires: Date.now() + expires,
		etag: res.headers.get('Etag') ?? undefined,
		lastModified: res.headers.get('Last-Modified') ?? undefined,
	};
}

/**
 * Revalidate a cached remote asset using its entity-tag or modified date.
 * Uses the [If-None-Match](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match) and [If-Modified-Since](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Modified-Since)
 * headers to check with the remote server if the cached version of a remote asset is still up to date.
 * The remote server may respond that the cached asset is still up-to-date if the entity-tag or modification time matches (304 Not Modified), or respond with an updated asset (200 OK)
 * @param src - url to remote asset
 * @param revalidationData - an object containing the stored Entity-Tag of the cached asset and/or the Last Modified time
 * @returns An ImageData object containing the asset data, a new expiry time, and the asset's etag. The data buffer will be empty if the asset was not modified.
 */
export async function revalidateRemoteImage(
	src: string,
	revalidationData: { etag?: string; lastModified?: string },
) {
	const headers = {
		...(revalidationData.etag && { 'If-None-Match': revalidationData.etag }),
		...(revalidationData.lastModified && { 'If-Modified-Since': revalidationData.lastModified }),
	};
	const req = new Request(src, { headers });
	const res = await fetch(req);

	// Asset not modified: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/304
	if (!res.ok && res.status !== 304) {
		throw new Error(
			`Failed to revalidate cached remote image ${src}. The request did not return a 200 OK / 304 NOT MODIFIED response. (received ${res.status} ${res.statusText})`,
		);
	}

	const data = Buffer.from(await res.arrayBuffer());

	if (res.ok && !data.length) {
		// Server did not include body but indicated cache was stale
		return await loadRemoteImage(src);
	}

	// calculate an expiration date based on the response's TTL
	const policy = new CachePolicy(
		webToCachePolicyRequest(req),
		webToCachePolicyResponse(
			res.ok ? res : new Response(null, { status: 200, headers: res.headers }),
		), // 304 responses themselves are not cacheable, so just pretend to get the refreshed TTL
	);
	const expires = policy.storable() ? policy.timeToLive() : 0;

	return {
		data,
		expires: Date.now() + expires,
		// While servers should respond with the same headers as a 200 response, if they don't we should reuse the stored value
		etag: res.headers.get('Etag') ?? (res.ok ? undefined : revalidationData.etag),
		lastModified:
			res.headers.get('Last-Modified') ?? (res.ok ? undefined : revalidationData.lastModified),
	};
}

function webToCachePolicyRequest({ url, method, headers: _headers }: Request): CachePolicy.Request {
	let headers: CachePolicy.Headers = {};
	// Be defensive here due to a cookie header bug in node@18.14.1 + undici
	try {
		headers = Object.fromEntries(_headers.entries());
	} catch {}
	return {
		method,
		url,
		headers,
	};
}

function webToCachePolicyResponse({ status, headers: _headers }: Response): CachePolicy.Response {
	let headers: CachePolicy.Headers = {};
	// Be defensive here due to a cookie header bug in node@18.14.1 + undici
	try {
		headers = Object.fromEntries(_headers.entries());
	} catch {}
	return {
		status,
		headers,
	};
}

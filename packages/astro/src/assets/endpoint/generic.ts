// @ts-expect-error
import { imageConfig } from 'astro:assets';
import { isRemotePath } from '@astrojs/internal-helpers/path';
import * as mime from 'mrmime';
import type { APIRoute } from '../../types/public/common.js';
import { getConfiguredImageService } from '../internal.js';
import { etag } from '../utils/etag.js';
import { isRemoteAllowed } from '../utils/remotePattern.js';

async function loadRemoteImage(src: URL, headers: Headers) {
	try {
		const res = await fetch(src, {
			// Forward all headers from the original request
			headers,
		});

		if (!res.ok) {
			return undefined;
		}

		return await res.arrayBuffer();
	} catch {
		return undefined;
	}
}

/**
 * Endpoint used in dev and SSR to serve optimized images by the base image services
 */
export const GET: APIRoute = async ({ request }) => {
	try {
		const imageService = await getConfiguredImageService();

		if (!('transform' in imageService)) {
			throw new Error('Configured image service is not a local service');
		}

		const url = new URL(request.url);
		const transform = await imageService.parseURL(url, imageConfig);

		if (!transform?.src) {
			throw new Error('Incorrect transform returned by `parseURL`');
		}

		let inputBuffer: ArrayBuffer | undefined = undefined;

		const isRemoteImage = isRemotePath(transform.src);
		const sourceUrl = isRemoteImage ? new URL(transform.src) : new URL(transform.src, url.origin);

		if (isRemoteImage && isRemoteAllowed(transform.src, imageConfig) === false) {
			return new Response('Forbidden', { status: 403 });
		}

		inputBuffer = await loadRemoteImage(sourceUrl, isRemoteImage ? new Headers() : request.headers);

		if (!inputBuffer) {
			return new Response('Not Found', { status: 404 });
		}

		const { data, format } = await imageService.transform(
			new Uint8Array(inputBuffer),
			transform,
			imageConfig,
		);

		return new Response(data, {
			status: 200,
			headers: {
				'Content-Type': mime.lookup(format) ?? `image/${format}`,
				'Cache-Control': 'public, max-age=31536000',
				ETag: etag(data.toString()),
				Date: new Date().toUTCString(),
			},
		});
	} catch (err: unknown) {
		console.error('Could not process image request:', err);
		return new Response(`Server Error: ${err}`, { status: 500 });
	}
};

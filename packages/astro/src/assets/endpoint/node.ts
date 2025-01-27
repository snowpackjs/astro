import { readFile } from 'node:fs/promises';

import os from 'node:os';
import { isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
// @ts-expect-error
import { assetsDir, imageConfig, outDir } from 'astro:assets';
import { isRemotePath, removeQueryString } from '@astrojs/internal-helpers/path';
import * as mime from 'mrmime';
import type { APIRoute } from '../../types/public/common.js';
import { getConfiguredImageService } from '../internal.js';
import { etag } from '../utils/etag.js';
import { isRemoteAllowed } from '../utils/remotePattern.js';

function replaceFileSystemReferences(src: string) {
	return os.platform().includes('win32') ? src.replace(/^\/@fs\//, '') : src.replace(/^\/@fs/, '');
}

async function loadLocalImage(src: string, url: URL) {
	const assetsDirPath = fileURLToPath(assetsDir);

	let fileUrl;
	if (import.meta.env.DEV) {
		fileUrl = pathToFileURL(removeQueryString(replaceFileSystemReferences(src)));
	} else {
		try {
			// If the _image segment isn't at the start of the path, we have a base
			const idx = url.pathname.indexOf('/_image');
			if (idx > 0) {
				// Remove the base path
				src = src.slice(idx);
			}
			fileUrl = new URL('.' + src, outDir);
			const filePath = fileURLToPath(fileUrl);

			if (!isAbsolute(filePath) || !filePath.startsWith(assetsDirPath)) {
				return undefined;
			}
		} catch {
			return undefined;
		}
	}

	let buffer: Buffer | undefined = undefined;

	try {
		buffer = await readFile(fileUrl);
	} catch {
		// Fallback to try to load the file using `fetch`
		try {
			const sourceUrl = new URL(src, url.origin);
			buffer = await loadRemoteImage(sourceUrl);
		} catch (err: unknown) {
			console.error('Could not process image request:', err);
			return undefined;
		}
	}

	return buffer;
}

async function loadRemoteImage(src: URL) {
	try {
		const res = await fetch(src);

		if (!res.ok) {
			return undefined;
		}

		return Buffer.from(await res.arrayBuffer());
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
			const err = new Error(
				'Incorrect transform returned by `parseURL`. Expected a transform with a `src` property.',
			);
			console.error('Could not parse image transform from URL:', err);
			return new Response('Internal Server Error', { status: 500 });
		}

		let inputBuffer: Buffer | undefined = undefined;

		if (isRemotePath(transform.src)) {
			if (isRemoteAllowed(transform.src, imageConfig) === false) {
				return new Response('Forbidden', { status: 403 });
			}

			inputBuffer = await loadRemoteImage(new URL(transform.src));
		} else {
			inputBuffer = await loadLocalImage(transform.src, url);
		}

		if (!inputBuffer) {
			return new Response('Internal Server Error', { status: 500 });
		}

		const { data, format } = await imageService.transform(inputBuffer, transform, imageConfig);

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
		return new Response(
			import.meta.env.DEV ? `Could not process image request: ${err}` : `Internal Server Error`,
			{
				status: 500,
			},
		);
	}
};

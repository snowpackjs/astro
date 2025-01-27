import fs from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Http2ServerResponse } from 'node:http2';
import type { RouteData } from '../../types/public/internal.js';
import { clientAddressSymbol } from '../constants.js';
import { deserializeManifest } from './common.js';
import { createOutgoingHttpHeaders } from './createOutgoingHttpHeaders.js';
import { App } from './index.js';
import type { RenderOptions } from './index.js';
import type { SSRManifest, SerializedSSRManifest } from './types.js';

export { apply as applyPolyfills } from '../polyfill.js';

/**
 * Allow the request body to be explicitly overridden. For example, this
 * is used by the Express JSON middleware.
 */
interface NodeRequest extends IncomingMessage {
	body?: unknown;
}

export class NodeApp extends App {
	match(req: NodeRequest | Request) {
		if (!(req instanceof Request)) {
			req = NodeApp.createRequest(req, {
				skipBody: true,
			});
		}
		return super.match(req);
	}
	render(request: NodeRequest | Request, options?: RenderOptions): Promise<Response>;
	/**
	 * @deprecated Instead of passing `RouteData` and locals individually, pass an object with `routeData` and `locals` properties.
	 * See https://github.com/withastro/astro/pull/9199 for more information.
	 */
	render(request: NodeRequest | Request, routeData?: RouteData, locals?: object): Promise<Response>;
	render(
		req: NodeRequest | Request,
		routeDataOrOptions?: RouteData | RenderOptions,
		maybeLocals?: object,
	) {
		if (!(req instanceof Request)) {
			req = NodeApp.createRequest(req);
		}
		// @ts-expect-error The call would have succeeded against the implementation, but implementation signatures of overloads are not externally visible.
		return super.render(req, routeDataOrOptions, maybeLocals);
	}

	/**
	 * Converts a NodeJS IncomingMessage into a web standard Request.
	 * ```js
	 * import { NodeApp } from 'astro/app/node';
	 * import { createServer } from 'node:http';
	 *
	 * const server = createServer(async (req, res) => {
	 *     const request = NodeApp.createRequest(req);
	 *     const response = await app.render(request);
	 *     await NodeApp.writeResponse(response, res);
	 * })
	 * ```
	 */
	static createRequest(req: NodeRequest, { skipBody = false } = {}): Request {
		const isEncrypted = 'encrypted' in req.socket && req.socket.encrypted;

		// Parses multiple header and returns first value if available.
		const getFirstForwardedValue = (multiValueHeader?: string | string[]) => {
			return multiValueHeader
				?.toString()
				?.split(',')
				.map((e) => e.trim())?.[0];
		};

		// Get the used protocol between the end client and first proxy.
		// NOTE: Some proxies append values with spaces and some do not.
		// We need to handle it here and parse the header correctly.
		// @example "https, http,http" => "http"
		const forwardedProtocol = getFirstForwardedValue(req.headers['x-forwarded-proto']);
		const protocol = forwardedProtocol ?? (isEncrypted ? 'https' : 'http');

		// @example "example.com,www2.example.com" => "example.com"
		const forwardedHostname = getFirstForwardedValue(req.headers['x-forwarded-host']);
		const hostname = forwardedHostname ?? req.headers.host ?? req.headers[':authority'];

		// @example "443,8080,80" => "443"
		const port = getFirstForwardedValue(req.headers['x-forwarded-port']);

		const portInHostname = typeof hostname === 'string' && /:\d+$/.test(hostname);
		const hostnamePort = portInHostname ? hostname : `${hostname}${port ? `:${port}` : ''}`;

		const url = `${protocol}://${hostnamePort}${req.url}`;
		const options: RequestInit = {
			method: req.method || 'GET',
			headers: makeRequestHeaders(req),
		};
		const bodyAllowed = options.method !== 'HEAD' && options.method !== 'GET' && skipBody === false;
		if (bodyAllowed) {
			Object.assign(options, makeRequestBody(req));
		}

		const request = new Request(url, options);

		// Get the IP of end client behind the proxy.
		// @example "1.1.1.1,8.8.8.8" => "1.1.1.1"
		const forwardedClientIp = getFirstForwardedValue(req.headers['x-forwarded-for']);
		const clientIp = forwardedClientIp || req.socket?.remoteAddress;
		if (clientIp) {
			Reflect.set(request, clientAddressSymbol, clientIp);
		}

		return request;
	}

	/**
	 * Streams a web-standard Response into a NodeJS Server Response.
	 * ```js
	 * import { NodeApp } from 'astro/app/node';
	 * import { createServer } from 'node:http';
	 *
	 * const server = createServer(async (req, res) => {
	 *     const request = NodeApp.createRequest(req);
	 *     const response = await app.render(request);
	 *     await NodeApp.writeResponse(response, res);
	 * })
	 * ```
	 * @param source WhatWG Response
	 * @param destination NodeJS ServerResponse
	 */
	static async writeResponse(source: Response, destination: ServerResponse) {
		const { status, headers, body, statusText } = source;
		// HTTP/2 doesn't support statusMessage
		if (!(destination instanceof Http2ServerResponse)) {
			destination.statusMessage = statusText;
		}
		destination.writeHead(status, createOutgoingHttpHeaders(headers));
		if (!body) return destination.end();
		try {
			const reader = body.getReader();
			destination.on('close', () => {
				// Cancelling the reader may reject not just because of
				// an error in the ReadableStream's cancel callback, but
				// also because of an error anywhere in the stream.
				reader.cancel().catch((err) => {
					console.error(
						`There was an uncaught error in the middle of the stream while rendering ${destination.req.url}.`,
						err,
					);
				});
			});
			let result = await reader.read();
			while (!result.done) {
				destination.write(result.value);
				result = await reader.read();
			}
			destination.end();
			// the error will be logged by the "on end" callback above
		} catch (err) {
			destination.write('Internal server error', () => {
				err instanceof Error ? destination.destroy(err) : destination.destroy();
			});
		}
	}
}

function makeRequestHeaders(req: NodeRequest): Headers {
	const headers = new Headers();
	for (const [name, value] of Object.entries(req.headers)) {
		if (value === undefined) {
			continue;
		}
		if (Array.isArray(value)) {
			for (const item of value) {
				headers.append(name, item);
			}
		} else {
			headers.append(name, value);
		}
	}
	return headers;
}

function makeRequestBody(req: NodeRequest): RequestInit {
	if (req.body !== undefined) {
		if (typeof req.body === 'string' && req.body.length > 0) {
			return { body: Buffer.from(req.body) };
		}

		if (typeof req.body === 'object' && req.body !== null && Object.keys(req.body).length > 0) {
			return { body: Buffer.from(JSON.stringify(req.body)) };
		}

		// This covers all async iterables including Readable and ReadableStream.
		if (
			typeof req.body === 'object' &&
			req.body !== null &&
			typeof (req.body as any)[Symbol.asyncIterator] !== 'undefined'
		) {
			return asyncIterableToBodyProps(req.body as AsyncIterable<any>);
		}
	}

	// Return default body.
	return asyncIterableToBodyProps(req);
}

function asyncIterableToBodyProps(iterable: AsyncIterable<any>): RequestInit {
	return {
		// Node uses undici for the Request implementation. Undici accepts
		// a non-standard async iterable for the body.
		// @ts-expect-error
		body: iterable,
		// The duplex property is required when using a ReadableStream or async
		// iterable for the body. The type definitions do not include the duplex
		// property because they are not up-to-date.
		duplex: 'half',
	};
}

export async function loadManifest(rootFolder: URL): Promise<SSRManifest> {
	const manifestFile = new URL('./manifest.json', rootFolder);
	const rawManifest = await fs.promises.readFile(manifestFile, 'utf-8');
	const serializedManifest: SerializedSSRManifest = JSON.parse(rawManifest);
	return deserializeManifest(serializedManifest);
}

export async function loadApp(rootFolder: URL): Promise<NodeApp> {
	const manifest = await loadManifest(rootFolder);
	return new NodeApp(manifest);
}

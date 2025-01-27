import type http from 'node:http';
import { Http2ServerResponse } from 'node:http2';
import type { ErrorWithMetadata } from '../core/errors/index.js';
import type { ModuleLoader } from '../core/module-loader/index.js';

import { Readable } from 'node:stream';
import { getSetCookiesFromResponse } from '../core/cookies/index.js';
import { getViteErrorPayload } from '../core/errors/dev/index.js';
import { redirectTemplate } from '../core/routing/3xx.js';
import notFoundTemplate from '../template/4xx.js';

export async function handle404Response(
	origin: string,
	req: http.IncomingMessage,
	res: http.ServerResponse,
) {
	const pathname = decodeURI(new URL(origin + req.url).pathname);

	const html = notFoundTemplate({
		statusCode: 404,
		title: 'Not found',
		tabTitle: '404: Not Found',
		pathname,
	});
	writeHtmlResponse(res, 404, html);
}

export async function handle500Response(
	loader: ModuleLoader,
	res: http.ServerResponse,
	err: ErrorWithMetadata,
) {
	res.on('close', async () =>
		setTimeout(async () => loader.webSocketSend(await getViteErrorPayload(err)), 200),
	);
	if (res.headersSent) {
		res.write(`<script type="module" src="/@vite/client"></script>`);
		res.end();
	} else {
		writeHtmlResponse(
			res,
			500,
			`<title>${err.name}</title><script type="module" src="/@vite/client"></script>`,
		);
	}
}

export function writeHtmlResponse(res: http.ServerResponse, statusCode: number, html: string) {
	res.writeHead(statusCode, {
		'Content-Type': 'text/html',
		'Content-Length': Buffer.byteLength(html, 'utf-8'),
	});
	res.write(html);
	res.end();
}

export function writeRedirectResponse(
	res: http.ServerResponse,
	statusCode: number,
	location: string,
) {
	const html = redirectTemplate({ status: statusCode, location });
	res.writeHead(statusCode, {
		Location: location,
		'Content-Type': 'text/html',
		'Content-Length': Buffer.byteLength(html, 'utf-8'),
	});
	res.write(html);
	res.end();
}

export async function writeWebResponse(res: http.ServerResponse, webResponse: Response) {
	const { status, headers, body, statusText } = webResponse;

	// Attach any set-cookie headers added via Astro.cookies.set()
	const setCookieHeaders = Array.from(getSetCookiesFromResponse(webResponse));
	if (setCookieHeaders.length) {
		// Always use `res.setHeader` because headers.append causes them to be concatenated.
		res.setHeader('set-cookie', setCookieHeaders);
	}

	const _headers: http.OutgoingHttpHeaders = Object.fromEntries(headers.entries());

	if (headers.has('set-cookie')) {
		_headers['set-cookie'] = headers.getSetCookie();
	}
	// HTTP/2 doesn't support statusMessage
	if (!(res instanceof Http2ServerResponse)) {
		res.statusMessage = statusText;
	}
	res.writeHead(status, _headers);
	if (body) {
		if (Symbol.for('astro.responseBody') in webResponse) {
			let stream = (webResponse as any)[Symbol.for('astro.responseBody')];
			for await (const chunk of stream) {
				res.write(chunk.toString());
			}
		} else if (body instanceof Readable) {
			body.pipe(res);
			return;
		} else if (typeof body === 'string') {
			res.write(body);
		} else {
			const reader = body.getReader();
			res.on('close', () => {
				reader.cancel().catch(() => {
					// Don't log here, or errors will get logged twice in most cases
				});
			});
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (value) {
					res.write(value);
				}
			}
		}
	}
	res.end();
}

export async function writeSSRResult(
	webRequest: Request,
	webResponse: Response,
	res: http.ServerResponse,
) {
	Reflect.set(webRequest, Symbol.for('astro.responseSent'), true);
	return writeWebResponse(res, webResponse);
}

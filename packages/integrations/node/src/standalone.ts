import http from 'node:http';
import https from 'https';
import fs from 'node:fs';
import enableDestroy from 'server-destroy';
import createAppListener from './serve-app.js';
import createStaticListener from './serve-static.js';
import logListeningOn from './log-listening-on.js';
import type { NodeApp } from 'astro/app/node';
import type { Options } from './types.js';
import type { PreviewServer } from 'astro';

export default function standalone(app: NodeApp, options: Options) {
	const port = process.env.PORT ? Number(process.env.PORT) : options.port ?? 8080;
	// Allow to provide host value at runtime
	const host_ = typeof options.host === "boolean" ? "localhost" : options.host
	const host = process.env.HOST ?? host_;
	const handler = createStandaloneHandler(app, options);
	const server = createServer(handler, host, port);
	server.server.listen(port, host)
	if (process.env.ASTRO_NODE_LOGGING !== "disabled") {
		logListeningOn(app.getAdapterLogger(), server.server, options)
	}
	return {
		server,
		done: server.closed(),
	};
}

// also used by server entrypoint
export function createStandaloneHandler(app: NodeApp, options: Options) {
	const appHandler = createAppListener(app);
	const staticHandler = createStaticListener(app, options);
	return (req: http.IncomingMessage, res: http.ServerResponse) => {
		try {
			// validate request path
			decodeURI(req.url!);
		} catch {
			res.writeHead(400);
			res.end('Bad request.');
			return;
		}
		staticHandler(req, res, () => appHandler(req, res));
	}
}

// also used by preview entrypoint
export function createServer(
	listener: http.RequestListener,
	host: string,
	port: number
) {
	let httpServer: http.Server | https.Server;

	if (process.env.SERVER_CERT_PATH && process.env.SERVER_KEY_PATH) {
		httpServer = https.createServer(
			{
				key: fs.readFileSync(process.env.SERVER_KEY_PATH),
				cert: fs.readFileSync(process.env.SERVER_CERT_PATH),
			},
			listener
		);
	} else {
		httpServer = http.createServer(listener);
	}
	enableDestroy(httpServer);

	// Resolves once the server is closed
	const closed = new Promise<void>((resolve, reject) => {
		httpServer.addListener('close', resolve);
		httpServer.addListener('error', reject);
	});
	
	const previewable = {
		host,
		port,
		closed() {
			return closed;
		},
		async stop() {
			await new Promise((resolve, reject) => {
				httpServer.destroy((err) => (err ? reject(err) : resolve(undefined)));
			});
		}
	} satisfies PreviewServer;

	return {
		server: httpServer,
		...previewable,
	};
}

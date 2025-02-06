import { fileURLToPath } from 'node:url';
import type { CreatePreviewServer } from 'astro';
import { AstroError } from 'astro/errors';
import { logListeningOn } from './log-listening-on.js';
import type { createExports } from './server.js';
import { createServer } from './standalone.js';

type ServerModule = ReturnType<typeof createExports>;
type MaybeServerModule = Partial<ServerModule>;

const createPreviewServer: CreatePreviewServer = async (preview) => {
	let ssrHandler: ServerModule['handler'];
	let options: ServerModule['options'];
	try {
		process.env.ASTRO_NODE_AUTOSTART = 'disabled';
		const ssrModule: MaybeServerModule = await import(preview.serverEntrypoint.toString());
		if (typeof ssrModule.handler === 'function') {
			ssrHandler = ssrModule.handler;
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			options = ssrModule.options!;
		} else {
			throw new AstroError(
				`The server entrypoint doesn't have a handler. Are you sure this is the right file?`,
			);
		}
	} catch (err) {
		if ((err as any).code === 'ERR_MODULE_NOT_FOUND') {
			throw new AstroError(
				`The server entrypoint ${fileURLToPath(
					preview.serverEntrypoint,
				)} does not exist. Have you ran a build yet?`,
			);
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else {
			throw err;
		}
	}
	// If the user didn't specify a host, it will already have been defaulted to
	// "localhost" by getResolvedHostForHttpServer in astro core/preview/util.ts.
	// The value `undefined` actually means that either the user set `options.server.host`
	// to `true`, or they passed `--host` without an argument. In that case, we
	// should listen on all IPs.
	const host = process.env.HOST ?? preview.host ?? '0.0.0.0';

	const port = preview.port ?? 4321;
	const server = createServer(ssrHandler, host, port);

	// If user specified custom headers append a listener
	// to the server to add those headers to response
	if (preview.headers) {
		server.server.addListener('request', (_, res) => {
			if (res.statusCode === 200) {
				for (const [name, value] of Object.entries(preview.headers ?? {})) {
					if (value) res.setHeader(name, value);
				}
			}
		});
	}

	logListeningOn(preview.logger, server.server, host);
	await new Promise<void>((resolve, reject) => {
		server.server.once('listening', resolve);
		server.server.once('error', reject);
		server.server.listen(port, host);
	});
	return server;
};

export { createPreviewServer as default };

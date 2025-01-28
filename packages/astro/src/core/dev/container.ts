import type * as http from 'node:http';
import type { AddressInfo } from 'node:net';
import type { AstroSettings } from '../../types/astro.js';

import nodeFs from 'node:fs';
import * as vite from 'vite';
import {
	runHookConfigDone,
	runHookConfigSetup,
	runHookServerDone,
	runHookServerStart,
} from '../../integrations/hooks.js';
import type { AstroInlineConfig } from '../../types/public/config.js';
import { createDevelopmentManifest } from '../../vite-plugin-astro-server/plugin.js';
import { createVite } from '../create-vite.js';
import type { Logger } from '../logger/core.js';
import { apply as applyPolyfill } from '../polyfill.js';
import { createRoutesList } from '../routing/index.js';
import { syncInternal } from '../sync/index.js';
import { warnMissingAdapter } from './adapter-validation.js';

export interface Container {
	fs: typeof nodeFs;
	logger: Logger;
	settings: AstroSettings;
	viteServer: vite.ViteDevServer;
	inlineConfig: AstroInlineConfig;
	restartInFlight: boolean; // gross
	handle: (req: http.IncomingMessage, res: http.ServerResponse) => void;
	close: () => Promise<void>;
}

export interface CreateContainerParams {
	logger: Logger;
	settings: AstroSettings;
	inlineConfig?: AstroInlineConfig;
	isRestart?: boolean;
	fs?: typeof nodeFs;
}

export async function createContainer({
	isRestart = false,
	logger,
	inlineConfig,
	settings,
	fs = nodeFs,
}: CreateContainerParams): Promise<Container> {
	// Initialize
	applyPolyfill();
	settings = await runHookConfigSetup({
		settings,
		command: 'dev',
		logger: logger,
		isRestart,
	});

	const {
		base,
		server: { host, headers, open: serverOpen },
	} = settings.config;

	// serverOpen = true, isRestart = false
	// when astro dev --open command is run the first time
	// expected behavior: spawn a new tab
	// ------------------------------------------------------
	// serverOpen = true, isRestart = true
	// when config file is saved
	// expected behavior: do not spawn a new tab
	// ------------------------------------------------------
	// Non-config files don't reach this point
	const isServerOpenURL = typeof serverOpen == 'string' && !isRestart;
	const isServerOpenBoolean = serverOpen && !isRestart;

	// Open server to the correct path. We pass the `base` here as we didn't pass the
	// base to the initial Vite config
	const open = isServerOpenURL ? serverOpen : isServerOpenBoolean ? base : false;

	// The client entrypoint for renderers. Since these are imported dynamically
	// we need to tell Vite to preoptimize them.
	const rendererClientEntries = settings.renderers
		.map((r) => r.clientEntrypoint)
		.filter(Boolean) as string[];

	// Create the route manifest already outside of Vite so that `runHookConfigDone` can use it to inform integrations of the build output
	const routesList = await createRoutesList({ settings, fsMod: fs }, logger, { dev: true });
	const manifest = createDevelopmentManifest(settings);

	await runHookConfigDone({ settings, logger, command: 'dev' });

	warnMissingAdapter(logger, settings);

	const mode = inlineConfig?.mode ?? 'development';
	const viteConfig = await createVite(
		{
			server: { host, headers, open },
			optimizeDeps: {
				include: rendererClientEntries,
			},
		},
		{
			settings,
			logger,
			mode,
			command: 'dev',
			fs,
			sync: false,
			routesList,
			manifest,
		},
	);
	const viteServer = await vite.createServer(viteConfig);

	await syncInternal({
		settings,
		mode,
		logger,
		skip: {
			content: !isRestart,
			cleanup: true,
		},
		force: inlineConfig?.force,
		routesList,
		manifest,
		command: 'dev',
		watcher: viteServer.watcher,
	});

	const container: Container = {
		inlineConfig: inlineConfig ?? {},
		fs,
		logger,
		restartInFlight: false,
		settings,
		viteServer,
		handle(req, res) {
			viteServer.middlewares.handle(req, res, Function.prototype);
		},
		// TODO deprecate and remove
		close() {
			return closeContainer(container);
		},
	};

	return container;
}

async function closeContainer({ viteServer, settings, logger }: Container) {
	await viteServer.close();
	await runHookServerDone({
		config: settings.config,
		logger,
	});
}

export async function startContainer({
	settings,
	viteServer,
	logger,
}: Container): Promise<AddressInfo> {
	const { port } = settings.config.server;
	await viteServer.listen(port);
	const devServerAddressInfo = viteServer.httpServer!.address() as AddressInfo;
	await runHookServerStart({
		config: settings.config,
		address: devServerAddressInfo,
		logger,
	});

	return devServerAddressInfo;
}

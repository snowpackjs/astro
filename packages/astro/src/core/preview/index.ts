import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { AstroIntegrationLogger } from '../../core/logger/core.js';
import { telemetry } from '../../events/index.js';
import { eventCliSession } from '../../events/session.js';
import { runHookConfigDone, runHookConfigSetup } from '../../integrations/hooks.js';
import type { AstroInlineConfig } from '../../types/public/config.js';
import type { PreviewModule, PreviewServer } from '../../types/public/preview.js';
import { resolveConfig } from '../config/config.js';
import { createNodeLogger } from '../config/logging.js';
import { createSettings } from '../config/settings.js';
import { apply as applyPolyfills } from '../polyfill.js';
import { createRoutesList } from '../routing/index.js';
import { ensureProcessNodeEnv } from '../util.js';
import createStaticPreviewServer from './static-preview-server.js';
import { getResolvedHostForHttpServer } from './util.js';

/**
 * Starts a local server to serve your static dist/ directory. This command is useful for previewing
 * your build locally, before deploying it. It is not designed to be run in production.
 *
 * @experimental The JavaScript API is experimental
 */
export default async function preview(inlineConfig: AstroInlineConfig): Promise<PreviewServer> {
	applyPolyfills();
	ensureProcessNodeEnv('production');
	const logger = createNodeLogger(inlineConfig);
	const { userConfig, astroConfig } = await resolveConfig(inlineConfig ?? {}, 'preview');
	telemetry.record(eventCliSession('preview', userConfig));

	const _settings = await createSettings(astroConfig, fileURLToPath(astroConfig.root));

	const settings = await runHookConfigSetup({
		settings: _settings,
		command: 'preview',
		logger: logger,
	});

	// Create a route manifest so we can know if the build output is a static site or not
	await createRoutesList({ settings: settings, cwd: inlineConfig.root }, logger);

	await runHookConfigDone({ settings: settings, logger: logger, command: 'preview' });

	if (settings.buildOutput === 'static') {
		if (!fs.existsSync(settings.config.outDir)) {
			const outDirPath = fileURLToPath(settings.config.outDir);
			throw new Error(
				`[preview] The output directory ${outDirPath} does not exist. Did you run \`astro build\`?`,
			);
		}
		const server = await createStaticPreviewServer(settings, logger);
		return server;
	}

	if (!settings.adapter) {
		throw new Error(`[preview] No adapter found.`);
	}

	if (!settings.adapter.previewEntrypoint) {
		throw new Error(
			`[preview] The ${settings.adapter.name} adapter does not support the preview command.`,
		);
	}
	// We need to use require.resolve() here so that advanced package managers like pnpm
	// don't treat this as a dependency of Astro itself. This correctly resolves the
	// preview entrypoint of the integration package, relative to the user's project root.
	const require = createRequire(settings.config.root);
	const previewEntrypointUrl = pathToFileURL(
		require.resolve(settings.adapter.previewEntrypoint.toString()),
	).href;

	const previewModule = (await import(previewEntrypointUrl)) as Partial<PreviewModule>;
	if (typeof previewModule.default !== 'function') {
		throw new Error(`[preview] ${settings.adapter.name} cannot preview your app.`);
	}

	const server = await previewModule.default({
		outDir: settings.config.outDir,
		client: settings.config.build.client,
		serverEntrypoint: new URL(settings.config.build.serverEntry, settings.config.build.server),
		host: getResolvedHostForHttpServer(settings.config.server.host),
		port: settings.config.server.port,
		base: settings.config.base,
		logger: new AstroIntegrationLogger(logger.options, settings.adapter.name),
		headers: settings.config.server.headers,
	});

	return server;
}

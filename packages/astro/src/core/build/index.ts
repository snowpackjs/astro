import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { blue, bold, green } from 'kleur/colors';
import type * as vite from 'vite';
import { telemetry } from '../../events/index.js';
import { eventCliSession } from '../../events/session.js';
import {
	runHookBuildDone,
	runHookBuildStart,
	runHookConfigDone,
	runHookConfigSetup,
} from '../../integrations/hooks.js';
import type { AstroSettings, RoutesList } from '../../types/astro.js';
import type { AstroInlineConfig, RuntimeMode } from '../../types/public/config.js';
import { createDevelopmentManifest } from '../../vite-plugin-astro-server/plugin.js';
import type { SSRManifest } from '../app/types.js';
import { resolveConfig } from '../config/config.js';
import { createNodeLogger } from '../config/logging.js';
import { createSettings } from '../config/settings.js';
import { createVite } from '../create-vite.js';
import { createKey, getEnvironmentKey, hasEnvironmentKey } from '../encryption.js';
import { AstroError, AstroErrorData } from '../errors/index.js';
import type { Logger } from '../logger/core.js';
import { levels, timerMessage } from '../logger/core.js';
import { apply as applyPolyfill } from '../polyfill.js';
import { createRoutesList } from '../routing/index.js';
import { getServerIslandRouteData } from '../server-islands/endpoint.js';
import { clearContentLayerCache } from '../sync/index.js';
import { ensureProcessNodeEnv } from '../util.js';
import { collectPagesData } from './page-data.js';
import { staticBuild, viteBuild } from './static-build.js';
import type { StaticBuildOptions } from './types.js';
import { getTimeStat } from './util.js';

export interface BuildOptions {
	/**
	 * Output a development-based build similar to code transformed in `astro dev`. This
	 * can be useful to test build-only issues with additional debugging information included.
	 *
	 * @default false
	 */
	devOutput?: boolean;
	/**
	 * Teardown the compiler WASM instance after build. This can improve performance when
	 * building once, but may cause a performance hit if building multiple times in a row.
	 *
	 * @internal only used for testing
	 * @default true
	 */
	teardownCompiler?: boolean;
}

/**
 * Builds your site for deployment. By default, this will generate static files and place them in a dist/ directory.
 * If SSR is enabled, this will generate the necessary server files to serve your site.
 *
 * @experimental The JavaScript API is experimental
 */
export default async function build(
	inlineConfig: AstroInlineConfig,
	options: BuildOptions = {},
): Promise<void> {
	ensureProcessNodeEnv(options.devOutput ? 'development' : 'production');
	applyPolyfill();
	const logger = createNodeLogger(inlineConfig);
	const { userConfig, astroConfig } = await resolveConfig(inlineConfig, 'build');
	telemetry.record(eventCliSession('build', userConfig));

	const settings = await createSettings(astroConfig, fileURLToPath(astroConfig.root));

	if (inlineConfig.force) {
		// isDev is always false, because it's interested in the build command, not the output type
		await clearContentLayerCache({ settings, logger, fs, isDev: false });
	}

	const builder = new AstroBuilder(settings, {
		...options,
		logger,
		mode: inlineConfig.mode ?? 'production',
		runtimeMode: options.devOutput ? 'development' : 'production',
	});
	await builder.run();
}

interface AstroBuilderOptions extends BuildOptions {
	logger: Logger;
	mode: string;
	runtimeMode: RuntimeMode;
}

class AstroBuilder {
	private settings: AstroSettings;
	private logger: Logger;
	private mode: string;
	private runtimeMode: RuntimeMode;
	private origin: string;
	private routesList: RoutesList;
	private timer: Record<string, number>;
	private teardownCompiler: boolean;
	private manifest: SSRManifest;

	constructor(settings: AstroSettings, options: AstroBuilderOptions) {
		this.mode = options.mode;
		this.runtimeMode = options.runtimeMode;
		this.settings = settings;
		this.logger = options.logger;
		this.teardownCompiler = options.teardownCompiler ?? true;
		this.origin = settings.config.site
			? new URL(settings.config.site).origin
			: `http://localhost:${settings.config.server.port}`;
		this.routesList = { routes: [] };
		// NOTE: this manifest is only used by the first build pass to make the `astro:manifest` function.
		// After the first build, the BuildPipeline comes into play, and it creates the proper manifest for generating the pages.
		this.manifest = createDevelopmentManifest(settings);
		this.timer = {};
	}

	/** Setup Vite and run any async setup logic that couldn't run inside of the constructor. */
	private async setup() {
		this.logger.debug('build', 'Initial setup...');
		const { logger } = this;
		this.timer.init = performance.now();
		this.settings = await runHookConfigSetup({
			settings: this.settings,
			command: 'build',
			logger: logger,
		});

		this.routesList = await createRoutesList({ settings: this.settings }, this.logger);

		await runHookConfigDone({ settings: this.settings, logger: logger, command: 'build' });

		// If we're building for the server, we need to ensure that an adapter is installed.
		// If the adapter installed does not support a server output, an error will be thrown when the adapter is added, so no need to check here.
		if (!this.settings.config.adapter && this.settings.buildOutput === 'server') {
			throw new AstroError(AstroErrorData.NoAdapterInstalled);
		}

		const viteConfig = await createVite(
			{
				server: {
					hmr: false,
					middlewareMode: true,
				},
			},
			{
				settings: this.settings,
				logger: this.logger,
				mode: this.mode,
				command: 'build',
				sync: false,
				routesList: this.routesList,
				manifest: this.manifest,
			},
		);

		const { syncInternal } = await import('../sync/index.js');
		await syncInternal({
			mode: this.mode,
			settings: this.settings,
			logger,
			fs,
			routesList: this.routesList,
			command: 'build',
			manifest: this.manifest,
		});

		return { viteConfig };
	}

	/** Run the build logic. build() is marked private because usage should go through ".run()" */
	private async build({ viteConfig }: { viteConfig: vite.InlineConfig }) {
		await runHookBuildStart({ config: this.settings.config, logging: this.logger });
		this.validateConfig();

		this.logger.info('build', `output: ${blue('"' + this.settings.buildOutput + '"')}`);
		this.logger.info('build', `directory: ${blue(fileURLToPath(this.settings.config.outDir))}`);
		if (this.settings.adapter) {
			this.logger.info('build', `adapter: ${green(this.settings.adapter.name)}`);
		}
		this.logger.info('build', 'Collecting build info...');
		this.timer.loadStart = performance.now();
		const { assets, allPages } = collectPagesData({
			settings: this.settings,
			logger: this.logger,
			manifest: this.routesList,
		});

		this.logger.debug('build', timerMessage('All pages loaded', this.timer.loadStart));

		// The names of each pages
		const pageNames: string[] = [];

		// Bundle the assets in your final build: This currently takes the HTML output
		// of every page (stored in memory) and bundles the assets pointed to on those pages.
		this.timer.buildStart = performance.now();
		this.logger.info(
			'build',
			green(`✓ Completed in ${getTimeStat(this.timer.init, performance.now())}.`),
		);

		const hasKey = hasEnvironmentKey();
		const keyPromise = hasKey ? getEnvironmentKey() : createKey();

		const opts: StaticBuildOptions = {
			allPages,
			settings: this.settings,
			logger: this.logger,
			routesList: this.routesList,
			runtimeMode: this.runtimeMode,
			origin: this.origin,
			pageNames,
			teardownCompiler: this.teardownCompiler,
			viteConfig,
			key: keyPromise,
		};

		const { internals, ssrOutputChunkNames } = await viteBuild(opts);

		const hasServerIslands = this.settings.serverIslandNameMap.size > 0;
		// Error if there are server islands but no adapter provided.
		if (hasServerIslands && this.settings.buildOutput !== 'server') {
			throw new AstroError(AstroErrorData.NoAdapterInstalledServerIslands);
		}

		await staticBuild(opts, internals, ssrOutputChunkNames);

		// Write any additionally generated assets to disk.
		this.timer.assetsStart = performance.now();
		Object.keys(assets).map((k) => {
			if (!assets[k]) return;
			const filePath = new URL(`file://${k}`);
			fs.mkdirSync(new URL('./', filePath), { recursive: true });
			fs.writeFileSync(filePath, assets[k], 'utf8');
			delete assets[k]; // free up memory
		});
		this.logger.debug('build', timerMessage('Additional assets copied', this.timer.assetsStart));

		// You're done! Time to clean up.
		await runHookBuildDone({
			settings: this.settings,
			pages: pageNames,
			routes: Object.values(allPages)
				.flat()
				.map((pageData) => pageData.route)
				.concat(hasServerIslands ? getServerIslandRouteData(this.settings.config) : []),
			logging: this.logger,
		});

		if (this.logger.level && levels[this.logger.level()] <= levels['info']) {
			await this.printStats({
				logger: this.logger,
				timeStart: this.timer.init,
				pageCount: pageNames.length,
				buildMode: this.settings.buildOutput!, // buildOutput is always set at this point
			});
		}
	}

	/** Build the given Astro project.  */
	async run() {
		this.settings.timer.start('Total build');

		const setupData = await this.setup();
		try {
			await this.build(setupData);
		} catch (_err) {
			throw _err;
		} finally {
			this.settings.timer.end('Total build');
			// Benchmark results
			this.settings.timer.writeStats();
		}
	}

	private validateConfig() {
		const { config } = this.settings;

		// outDir gets blown away so it can't be the root.
		if (config.outDir.toString() === config.root.toString()) {
			throw new Error(
				`the outDir cannot be the root folder. Please build to a folder such as dist.`,
			);
		}
	}

	/** Stats */
	private async printStats({
		logger,
		timeStart,
		pageCount,
		buildMode,
	}: {
		logger: Logger;
		timeStart: number;
		pageCount: number;
		buildMode: AstroSettings['buildOutput'];
	}) {
		const total = getTimeStat(timeStart, performance.now());

		let messages: string[] = [];
		if (buildMode === 'static') {
			messages = [`${pageCount} page(s) built in`, bold(total)];
		} else {
			messages = ['Server built in', bold(total)];
		}

		logger.info('build', messages.join(' '));
		logger.info('build', `${bold('Complete!')}`);
	}
}

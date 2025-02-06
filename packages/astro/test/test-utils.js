import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripVTControlCharacters } from 'node:util';
import { execa } from 'execa';
import fastGlob from 'fast-glob';
import { Agent } from 'undici';
import { check } from '../dist/cli/check/index.js';
import { globalContentLayer } from '../dist/content/content-layer.js';
import { globalContentConfigObserver } from '../dist/content/utils.js';
import build from '../dist/core/build/index.js';
import { mergeConfig, resolveConfig } from '../dist/core/config/index.js';
import { dev, preview } from '../dist/core/index.js';
import { nodeLogDestination } from '../dist/core/logger/node.js';
import sync from '../dist/core/sync/index.js';

// Disable telemetry when running tests
process.env.ASTRO_TELEMETRY_DISABLED = true;

/**
 * @typedef {import('../src/core/dev/dev').DevServer} DevServer
 * @typedef {import('../src/types/public/config.js').AstroInlineConfig & { root?: string | URL }} AstroInlineConfig
 * @typedef {import('../src/types/public/config.js').AstroConfig} AstroConfig
 * @typedef {import('../src/core/preview/index').PreviewServer} PreviewServer
 * @typedef {import('../src/core/app/index').App} App
 * @typedef {import('../src/cli/check/index').AstroChecker} AstroChecker
 * @typedef {import('../src/cli/check/index').CheckPayload} CheckPayload
 * @typedef {import('http').IncomingMessage} NodeRequest
 * @typedef {import('http').ServerResponse} NodeResponse
 *
 *
 * @typedef {Object} Fixture
 * @property {typeof build} build
 * @property {(url: string) => string} resolveUrl
 * @property {(path: string) => Promise<boolean>} pathExists
 * @property {(url: string, opts?: Parameters<typeof fetch>[1]) => Promise<Response>} fetch
 * @property {(path: string) => Promise<string>} readFile
 * @property {(path: string, updater: (content: string) => string) => Promise<void>} editFile
 * @property {(path: string) => Promise<string[]>} readdir
 * @property {(pattern: string) => Promise<string[]>} glob
 * @property {(inlineConfig?: Parameters<typeof dev>[0]) => ReturnType<typeof dev>} startDevServer
 * @property {typeof preview} preview
 * @property {() => Promise<void>} clean
 * @property {() => Promise<App>} loadTestAdapterApp
 * @property {() => Promise<(req: NodeRequest, res: NodeResponse) => void>} loadNodeAdapterHandler
 * @property {() => Promise<void>} onNextChange
 * @property {(timeout?: number) => Promise<void>} onNextDataStoreChange
 * @property {typeof check} check
 * @property {typeof sync} sync
 * @property {AstroConfig} config
 *
 * This function returns an instance of the Check
 *
 *
 * When used in a test suite:
 * ```js
 * let fixture = await loadFixture({
 *   root: './fixtures/astro-check-watch/',
 * });
 * ```
 * `opts` will override the options passed to the `AstroChecker`
 *
 * ```js
 * let { check, stop, watch } = fixture.check({
 *   flags: { watch: true },
 * });
 * ```
 */

/** @type {import('../src/core/logger/core').LogOptions} */
export const defaultLogging = {
	dest: nodeLogDestination,
	level: 'error',
};

/** @type {import('../src/core/logger/core').LogOptions} */
export const silentLogging = {
	dest: nodeLogDestination,
	level: 'silent',
};

/**
 * Load Astro fixture
 * @param {AstroInlineConfig} inlineConfig Astro config partial (note: must specify `root`)
 * @returns {Promise<Fixture>} The fixture. Has the following properties:
 *   .config     - Returns the final config. Will be automatically passed to the methods below:
 *
 *   Build
 *   .build()          - Async. Builds into current folder (will erase previous build)
 *   .readFile(path)   - Async. Read a file from the build.
 *
 *   Dev
 *   .startDevServer() - Async. Starts a dev server at an available port. Be sure to call devServer.stop() before test exit.
 *   .fetch(url)       - Async. Returns a URL from the preview server (must have called .preview() before)
 *
 *   Preview
 *   .preview()        - Async. Starts a preview server. Note this can’t be running in same fixture as .dev() as they share ports. Also, you must call `server.close()` before test exit
 *
 *   Clean-up
 *   .clean()          - Async. Removes the project’s dist folder.
 */
export async function loadFixture(inlineConfig) {
	if (!inlineConfig?.root) throw new Error("Must provide { root: './fixtures/...' }");

	// Silent by default during tests to not pollute the console output
	inlineConfig.logLevel = 'silent';
	inlineConfig.vite ??= {};
	inlineConfig.vite.logLevel = 'silent';

	let root = inlineConfig.root;
	// Handle URL, should already be absolute so just convert to path
	if (typeof root !== 'string') {
		root = fileURLToPath(root);
	}
	// Handle "file:///C:/Users/fred", convert to "C:/Users/fred"
	else if (root.startsWith('file://')) {
		root = fileURLToPath(new URL(root));
	}
	// Handle "./fixtures/...", convert to absolute path
	else if (!path.isAbsolute(root)) {
		root = fileURLToPath(new URL(root, import.meta.url));
	}
	inlineConfig = { ...inlineConfig, root };
	// Load the config.
	const { astroConfig: config } = await resolveConfig(inlineConfig, 'dev');

	const protocol = config.vite?.server?.https ? 'https' : 'http';

	const resolveUrl = (url) =>
		`${protocol}://${config.server.host || 'localhost'}:${config.server.port}${url.replace(
			/^\/?/,
			'/',
		)}`;

	// A map of files that have been edited.
	let fileEdits = new Map();

	const resetAllFiles = () => {
		for (const [, reset] of fileEdits) {
			reset();
		}
		fileEdits.clear();
	};

	const onNextChange = () =>
		devServer
			? new Promise((resolve) => devServer.watcher.once('change', resolve))
			: Promise.reject(new Error('No dev server running'));

	// After each test, reset each of the edits to their original contents.
	if (typeof afterEach === 'function') {
		afterEach(resetAllFiles);
	}
	// Also do it on process exit, just in case.
	process.on('exit', resetAllFiles);

	let fixtureId = new Date().valueOf();
	let devServer;

	return {
		build: async (extraInlineConfig = {}, options = {}) => {
			globalContentLayer.dispose();
			globalContentConfigObserver.set({ status: 'init' });
			// Reset NODE_ENV so it can be re-set by `build()`
			delete process.env.NODE_ENV;
			return build(mergeConfig(inlineConfig, extraInlineConfig), {
				teardownCompiler: false,
				...options,
			});
		},
		sync,
		check: async (opts) => {
			return await check(opts);
		},
		startDevServer: async (extraInlineConfig = {}) => {
			globalContentLayer.dispose();
			globalContentConfigObserver.set({ status: 'init' });
			// Reset NODE_ENV so it can be re-set by `dev()`
			delete process.env.NODE_ENV;
			devServer = await dev(mergeConfig(inlineConfig, extraInlineConfig));
			config.server.host = parseAddressToHost(devServer.address.address); // update host
			config.server.port = devServer.address.port; // update port
			await new Promise((resolve) => setTimeout(resolve, 100));
			return devServer;
		},
		onNextDataStoreChange: (timeout = 5000) => {
			if (!devServer) {
				return Promise.reject(new Error('No dev server running'));
			}

			const dataStoreFile = path.join(root, '.astro', 'data-store.json');

			return new Promise((resolve, reject) => {
				const changeHandler = (fileName) => {
					if (fileName === dataStoreFile) {
						devServer.watcher.removeListener('change', changeHandler);
						resolve();
					}
				};
				devServer.watcher.on('change', changeHandler);
				setTimeout(() => {
					devServer.watcher.removeListener('change', changeHandler);
					reject(new Error('Data store did not update within timeout'));
				}, timeout);
			});
		},
		config,
		resolveUrl,
		fetch: async (url, init) => {
			if (config.vite?.server?.https) {
				init = {
					// Use a custom fetch dispatcher. This is an undici option that allows
					// us to customize the fetch behavior. We use it here to allow h2.
					dispatcher: new Agent({
						connect: {
							// We disable cert validation because we're using self-signed certs
							rejectUnauthorized: false,
						},
						// Enable HTTP/2 support
						allowH2: true,
					}),
					...init,
				};
			}
			const resolvedUrl = resolveUrl(url);
			try {
				return await fetch(resolvedUrl, init);
			} catch (err) {
				// node fetch throws a vague error when it fails, so we log the url here to easily debug it
				if (err.message?.includes('fetch failed')) {
					console.error(`[astro test] failed to fetch ${resolvedUrl}`);
					console.error(err);
				}
				throw err;
			}
		},
		preview: async (extraInlineConfig = {}) => {
			// Reset NODE_ENV so it can be re-set by `preview()`
			delete process.env.NODE_ENV;
			const previewServer = await preview(mergeConfig(inlineConfig, extraInlineConfig));
			config.server.host = parseAddressToHost(previewServer.host); // update host
			config.server.port = previewServer.port; // update port
			return previewServer;
		},
		pathExists: (p) => fs.existsSync(new URL(p.replace(/^\//, ''), config.outDir)),
		readFile: (filePath, encoding) =>
			fs.promises.readFile(
				new URL(filePath.replace(/^\//, ''), config.outDir),
				encoding === undefined ? 'utf8' : encoding,
			),
		readdir: (fp) => fs.promises.readdir(new URL(fp.replace(/^\//, ''), config.outDir)),
		glob: (p) =>
			fastGlob(p, {
				cwd: fileURLToPath(config.outDir),
			}),
		clean: async () => {
			await fs.promises.rm(config.outDir, {
				maxRetries: 10,
				recursive: true,
				force: true,
			});
			const astroCache = new URL('./node_modules/.astro', config.root);
			if (fs.existsSync(astroCache)) {
				await fs.promises.rm(astroCache, {
					maxRetries: 10,
					recursive: true,
					force: true,
				});
			}
		},
		loadAdapterEntryModule: async () => {
			const url = new URL(`./server/entry.mjs?id=${fixtureId}`, config.outDir);
			return await import(url);
		},
		loadNodeAdapterHandler: async () => {
			const url = new URL(`./server/entry.mjs?id=${fixtureId}`, config.outDir);
			const { handler } = await import(url);
			return handler;
		},
		loadTestAdapterApp: async (streaming) => {
			const url = new URL(`./server/entry.mjs?id=${fixtureId}`, config.outDir);
			const { createApp, manifest } = await import(url);
			const app = createApp(streaming);
			app.manifest = manifest;
			return app;
		},
		editFile: async (filePath, newContentsOrCallback, waitForNextWrite = true) => {
			const fileUrl = new URL(filePath.replace(/^\//, ''), config.root);
			const contents = await fs.promises.readFile(fileUrl, 'utf-8');
			const reset = () => {
				fs.writeFileSync(fileUrl, contents);
			};
			// Only save this reset if not already in the map, in case multiple edits happen
			// to the same file.
			if (!fileEdits.has(fileUrl.toString())) {
				fileEdits.set(fileUrl.toString(), reset);
			}
			const newContents =
				typeof newContentsOrCallback === 'function'
					? newContentsOrCallback(contents)
					: newContentsOrCallback;
			const nextChange = devServer && waitForNextWrite ? onNextChange() : Promise.resolve();
			await fs.promises.writeFile(fileUrl, newContents);
			await nextChange;
			return reset;
		},
		resetAllFiles,
	};
}

/**
 * @param {string} [address]
 */
function parseAddressToHost(address) {
	if (address?.startsWith('::')) {
		return `[${address}]`;
	}
	return address;
}

const cliPath = fileURLToPath(new URL('../astro.js', import.meta.url));

/** Returns a process running the Astro CLI. */
export function cli(/** @type {string[]} */ ...args) {
	const spawned = execa('node', [cliPath, ...args], {
		env: { ASTRO_TELEMETRY_DISABLED: true },
	});

	spawned.stdout.setEncoding('utf8');

	return spawned;
}

export async function parseCliDevStart(proc) {
	let stdout = '';
	let stderr = '';

	for await (const chunk of proc.stdout) {
		stdout += chunk;
		if (chunk.includes('Local')) break;
	}
	if (!stdout) {
		for await (const chunk of proc.stderr) {
			stderr += chunk;
			break;
		}
	}

	proc.kill();
	stdout = stripVTControlCharacters(stdout);
	stderr = stripVTControlCharacters(stderr);

	if (stderr) {
		throw new Error(stderr);
	}

	const messages = stdout
		.split('\n')
		.filter((ln) => !!ln.trim())
		.map((ln) => ln.replace(/[🚀┃]/gu, '').replace(/\s+/g, ' ').trim());

	return { messages };
}

export async function cliServerLogSetup(flags = [], cmd = 'dev') {
	const proc = cli(cmd, ...flags);

	const { messages } = await parseCliDevStart(proc);

	const local = messages.find((msg) => msg.includes('Local'))?.replace(/Local\s*/g, '');
	const network = messages.find((msg) => msg.includes('Network'))?.replace(/Network\s*/g, '');

	return { local, network };
}

export const isLinux = os.platform() === 'linux';
export const isMacOS = os.platform() === 'darwin';
export const isWindows = os.platform() === 'win32';

export function fixLineEndings(str) {
	return str.replace(/\r\n/g, '\n');
}

export async function* streamAsyncIterator(stream) {
	const reader = stream.getReader();

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) return;
			yield value;
		}
	} finally {
		reader.releaseLock();
	}
}

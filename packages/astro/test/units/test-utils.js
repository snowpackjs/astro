import { EventEmitter } from 'node:events';
import realFS from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createFixture as _createFixture } from 'fs-fixture';
import httpMocks from 'node-mocks-http';
import { getDefaultClientDirectives } from '../../dist/core/client-directive/index.js';
import { resolveConfig } from '../../dist/core/config/index.js';
import { createBaseSettings } from '../../dist/core/config/settings.js';
import { createContainer } from '../../dist/core/dev/container.js';
import { Logger } from '../../dist/core/logger/core.js';
import { nodeLogDestination } from '../../dist/core/logger/node.js';
import { NOOP_MIDDLEWARE_FN } from '../../dist/core/middleware/noop-middleware.js';
import { Pipeline } from '../../dist/core/render/index.js';
import { RouteCache } from '../../dist/core/render/route-cache.js';

/** @type {import('../../src/core/logger/core').Logger} */
export const defaultLogger = new Logger({
	dest: nodeLogDestination,
	level: 'error',
});

/** @type {import('../../src/core/logger/core').LogOptions} */
export const silentLogging = {
	dest: nodeLogDestination,
	level: 'error',
};

const tempFixturesDir = fileURLToPath(new URL('./_temp-fixtures/', import.meta.url));

/**
 * @param {import('fs-fixture').FileTree} tree
 */
export async function createFixture(tree) {
	return await _createFixture(
		{
			'package.json': '{}',
			...tree,
		},
		{
			tempDir: tempFixturesDir,
		},
	);
}

export function createRequestAndResponse(reqOptions = {}) {
	const req = httpMocks.createRequest(reqOptions);
	req.headers.host ||= 'localhost';

	const res = httpMocks.createResponse({
		eventEmitter: EventEmitter,
		req,
	});

	// When the response is complete.
	const done = toPromise(res);

	// Get the response as text
	const text = async () => {
		let chunks = await done;
		return buffersToString(chunks);
	};

	// Get the response as json
	const json = async () => {
		const raw = await text();
		return JSON.parse(raw);
	};

	return { req, res, done, json, text };
}

export function toPromise(res) {
	return new Promise((resolve) => {
		// node-mocks-http doesn't correctly handle non-Buffer typed arrays,
		// so override the write method to fix it.
		const write = res.write;
		res.write = function (data, encoding) {
			if (ArrayBuffer.isView(data) && !Buffer.isBuffer(data)) {
				data = Buffer.from(data.buffer);
			}
			if (typeof data === 'string') {
				data = Buffer.from(data);
			}
			return write.call(this, data, encoding);
		};
		res.on('end', () => {
			let chunks = res._getChunks();
			resolve(chunks);
		});
	});
}

export function buffersToString(buffers) {
	let decoder = new TextDecoder();
	let str = '';
	for (const buffer of buffers) {
		str += decoder.decode(buffer);
	}
	return str;
}

// A convenience method for creating an astro module from a component
export const createAstroModule = (AstroComponent) => ({ default: AstroComponent });

/**
 * @param {Partial<Pipeline>} options
 * @returns {Pipeline}
 */
export function createBasicPipeline(options = {}) {
	const mode = options.mode ?? 'development';
	const pipeline = new Pipeline(
		options.logger ?? defaultLogger,
		options.manifest ?? {
			hrefRoot: import.meta.url,
		},
		options.mode ?? 'development',
		options.renderers ?? [],
		options.resolve ?? ((s) => Promise.resolve(s)),
		options.serverLike ?? true,
		options.streaming ?? true,
		options.adapterName,
		options.clientDirectives ?? getDefaultClientDirectives(),
		options.inlinedScripts ?? [],
		options.compressHTML,
		options.i18n,
		options.middleware,
		options.routeCache ?? new RouteCache(options.logging, mode),
		options.site,
	);
	pipeline.headElements = () => ({ scripts: new Set(), styles: new Set(), links: new Set() });
	pipeline.componentMetadata = () => new Map();
	pipeline.getMiddleware = () => {
		return NOOP_MIDDLEWARE_FN;
	};
	return pipeline;
}

/**
 * @param {import('../../src/types/public/config.js').AstroInlineConfig} inlineConfig
 * @returns {Promise<import('../../src/types/astro.js').AstroSettings>}
 */
export async function createBasicSettings(inlineConfig = {}) {
	if (!inlineConfig.root) {
		inlineConfig.root = fileURLToPath(new URL('.', import.meta.url));
	}
	const { astroConfig } = await resolveConfig(inlineConfig, 'dev');
	return createBaseSettings(astroConfig);
}

/**
 * @typedef {{
 * 	fs?: typeof realFS,
 * 	inlineConfig?: import('../../src/types/public/config.js').AstroInlineConfig,
 *  logging?: import('../../src/core/logger/core').LogOptions,
 * }} RunInContainerOptions
 */

/**
 * @param {RunInContainerOptions} options
 * @param {(container: import('../../src/core/dev/container.js').Container) => Promise<void> | void} callback
 */
export async function runInContainer(options = {}, callback) {
	const settings = await createBasicSettings(options.inlineConfig ?? {});
	const container = await createContainer({
		fs: options?.fs ?? realFS,
		settings,
		inlineConfig: options.inlineConfig ?? {},
		logger: defaultLogger,
	});
	try {
		await callback(container);
	} finally {
		await container.close();
	}
}

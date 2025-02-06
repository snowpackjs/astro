import { existsSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { AstroIntegrationLogger } from 'astro';
import {
	ASTRO_LOCALS_HEADER,
	ASTRO_MIDDLEWARE_SECRET_HEADER,
	ASTRO_PATH_HEADER,
	NODE_PATH,
} from '../index.js';

/**
 * It generates the Vercel Edge Middleware file.
 *
 * It creates a temporary file, the edge middleware, with some dynamic info.
 *
 * Then this file gets bundled with esbuild. The bundle phase will inline the Astro middleware code.
 *
 * @param astroMiddlewareEntryPointPath
 * @param root
 * @param vercelEdgeMiddlewareHandlerPath
 * @param outPath
 * @param middlewareSecret
 * @param logger
 * @returns {Promise<URL>} The path to the bundled file
 */
export async function generateEdgeMiddleware(
	astroMiddlewareEntryPointPath: URL,
	root: URL,
	vercelEdgeMiddlewareHandlerPath: URL,
	outPath: URL,
	middlewareSecret: string,
	logger: AstroIntegrationLogger
): Promise<URL> {
	const code = edgeMiddlewareTemplate(
		astroMiddlewareEntryPointPath,
		vercelEdgeMiddlewareHandlerPath,
		middlewareSecret,
		logger
	);
	// https://vercel.com/docs/concepts/functions/edge-middleware#create-edge-middleware
	const bundledFilePath = fileURLToPath(outPath);
	const esbuild = await import('esbuild');
	await esbuild.build({
		stdin: {
			contents: code,
			resolveDir: fileURLToPath(root),
		},
		// Vercel Edge runtime targets ESNext, because Cloudflare Workers update v8 weekly
		// https://github.com/vercel/vercel/blob/1006f2ae9d67ea4b3cbb1073e79d14d063d42436/packages/next/scripts/build-edge-function-template.js
		target: 'esnext',
		platform: 'browser',
		// esbuild automatically adds the browser, import and default conditions
		// https://esbuild.github.io/api/#conditions
		// https://runtime-keys.proposal.wintercg.org/#edge-light
		conditions: ['edge-light', 'workerd', 'worker'],
		outfile: bundledFilePath,
		allowOverwrite: true,
		format: 'esm',
		bundle: true,
		minify: false,
		// ensure node built-in modules are namespaced with `node:`
		plugins: [
			{
				name: 'esbuild-namespace-node-built-in-modules',
				setup(build) {
					const filter = new RegExp(builtinModules.map((mod) => `(^${mod}$)`).join('|'));
					build.onResolve({ filter }, (args) => ({ path: 'node:' + args.path, external: true }));
				},
			},
		],
	});
	return pathToFileURL(bundledFilePath);
}

function edgeMiddlewareTemplate(
	astroMiddlewareEntryPointPath: URL,
	vercelEdgeMiddlewareHandlerPath: URL,
	middlewareSecret: string,
	logger: AstroIntegrationLogger
) {
	const middlewarePath = JSON.stringify(
		fileURLToPath(astroMiddlewareEntryPointPath).replace(/\\/g, '/')
	);
	const filePathEdgeMiddleware = fileURLToPath(vercelEdgeMiddlewareHandlerPath);
	let handlerTemplateImport = '';
	let handlerTemplateCall = '{}';
	if (existsSync(filePathEdgeMiddleware + '.js') || existsSync(filePathEdgeMiddleware + '.ts')) {
		logger.warn(
			'Usage of `vercel-edge-middleware.js` is deprecated. You can now use the `waitUntil(promise)` function directly as `ctx.locals.waitUntil(promise)`.'
		);
		const stringified = JSON.stringify(filePathEdgeMiddleware.replace(/\\/g, '/'));
		handlerTemplateImport = `import handler from ${stringified}`;
		handlerTemplateCall = `await handler({ request, context })`;
	} else {
	}
	return `
	${handlerTemplateImport}
import { onRequest } from ${middlewarePath};
import { createContext, trySerializeLocals } from 'astro/middleware';
export default async function middleware(request, context) {
	const ctx = createContext({
		request,
		params: {}
	});
	Object.assign(ctx.locals, { vercel: { edge: context }, ...${handlerTemplateCall} });
	const { origin } = new URL(request.url);
	const next = async () => {
		const { vercel, ...locals } = ctx.locals;
		const response = await fetch(new URL('/${NODE_PATH}', request.url), {
			headers: {
				...Object.fromEntries(request.headers.entries()),
				'${ASTRO_MIDDLEWARE_SECRET_HEADER}': '${middlewareSecret}',
				'${ASTRO_PATH_HEADER}': request.url.replace(origin, ''),
				'${ASTRO_LOCALS_HEADER}': trySerializeLocals(locals)
			}
		});
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers,
		});
	};

	const response = await onRequest(ctx, next);
	// Append cookies from Astro.cookies
	for(const setCookieHeaderValue of ctx.cookies.headers()) {
		response.headers.append('set-cookie', setCookieHeaderValue);
	}
	return response;
}`;
}

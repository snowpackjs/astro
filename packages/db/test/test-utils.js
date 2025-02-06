import { createServer } from 'node:http';
import { createClient } from '@libsql/client';
import { z } from 'zod';
import { cli } from '../dist/core/cli/index.js';
import { resolveDbConfig } from '../dist/core/load-file.js';
import { getCreateIndexQueries, getCreateTableQuery } from '../dist/core/queries.js';
import { isDbError } from '../dist/runtime/utils.js';

const singleQuerySchema = z.object({
	sql: z.string(),
	args: z.array(z.any()).or(z.record(z.string(), z.any())),
});

const querySchema = singleQuerySchema.or(z.array(singleQuerySchema));

let portIncrementer = 8030;

/**
 * @param {import('astro').AstroConfig} astroConfig
 * @param {number | undefined} port
 */
export async function setupRemoteDbServer(astroConfig) {
	const port = portIncrementer++;
	process.env.ASTRO_STUDIO_REMOTE_DB_URL = `http://localhost:${port}`;
	process.env.ASTRO_INTERNAL_TEST_REMOTE = true;
	const server = createRemoteDbServer().listen(port);

	const { dbConfig } = await resolveDbConfig(astroConfig);
	const setupQueries = [];
	for (const [name, table] of Object.entries(dbConfig?.tables ?? {})) {
		const createQuery = getCreateTableQuery(name, table);
		const indexQueries = getCreateIndexQueries(name, table);
		setupQueries.push(createQuery, ...indexQueries);
	}
	await fetch(`http://localhost:${port}/db/query`, {
		method: 'POST',
		body: JSON.stringify(setupQueries.map((sql) => ({ sql, args: [] }))),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	await cli({
		config: astroConfig,
		flags: {
			_: [undefined, 'astro', 'db', 'execute', 'db/seed.ts'],
			remote: true,
		},
	});

	return {
		server,
		async stop() {
			delete process.env.ASTRO_STUDIO_REMOTE_DB_URL;
			delete process.env.ASTRO_INTERNAL_TEST_REMOTE;
			return new Promise((resolve, reject) => {
				server.close((err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		},
	};
}

export async function initializeRemoteDb(astroConfig) {
	await cli({
		config: astroConfig,
		flags: {
			_: [undefined, 'astro', 'db', 'push'],
			remote: true,
		},
	});
	await cli({
		config: astroConfig,
		flags: {
			_: [undefined, 'astro', 'db', 'execute', 'db/seed.ts'],
			remote: true,
		},
	});
}

/**
 * Clears the environment variables related to Astro DB and Astro Studio.
 */
export function clearEnvironment() {
	const keys = Array.from(Object.keys(process.env));
	for (const key of keys) {
		if (key.startsWith('ASTRO_DB_') || key.startsWith('ASTRO_STUDIO_')) {
			delete process.env[key];
		}
	}
}

function createRemoteDbServer() {
	const dbClient = createClient({
		url: ':memory:',
	});
	const server = createServer((req, res) => {
		if (
			!req.url.startsWith('/db/query') ||
			req.method !== 'POST' ||
			req.headers['content-type'] !== 'application/json'
		) {
			res.writeHead(404, { 'Content-Type': 'application/json' });
			res.end(
				JSON.stringify({
					success: false,
				}),
			);
			return;
		}
		const rawBody = [];
		req.on('data', (chunk) => {
			rawBody.push(chunk);
		});
		req.on('end', async () => {
			let json;
			try {
				json = JSON.parse(Buffer.concat(rawBody).toString());
			} catch {
				applyParseError(res);
				return;
			}
			const parsed = querySchema.safeParse(json);
			if (parsed.success === false) {
				applyParseError(res);
				return;
			}
			const body = parsed.data;
			try {
				const result = Array.isArray(body)
					? await dbClient.batch(body)
					: await dbClient.execute(body);
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify(result));
			} catch (e) {
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.statusMessage = e.message;
				res.end(
					JSON.stringify({
						success: false,
						error: {
							code: isDbError(e) ? e.code : 'SQLITE_QUERY_FAILED',
							details: e.message,
						},
					}),
				);
			}
		});
	});

	server.on('close', () => {
		dbClient.close();
	});

	return server;
}

function applyParseError(res) {
	res.writeHead(400, { 'Content-Type': 'application/json' });
	res.statusMessage = 'Invalid request body';
	res.end(
		JSON.stringify({
			// Use JSON response with `success: boolean` property
			// to match remote error responses.
			success: false,
		}),
	);
}

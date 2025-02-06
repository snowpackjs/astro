import type { InStatement } from '@libsql/client';
import { type Config as LibSQLConfig, createClient } from '@libsql/client';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { type SqliteRemoteDatabase, drizzle as drizzleProxy } from 'drizzle-orm/sqlite-proxy';
import { z } from 'zod';
import { DetailedLibsqlError, safeFetch } from './utils.js';

const isWebContainer = !!process.versions?.webcontainer;

function applyTransactionNotSupported(db: SqliteRemoteDatabase) {
	Object.assign(db, {
		transaction() {
			throw new Error(
				'`db.transaction()` is not currently supported. We recommend `db.batch()` for automatic error rollbacks across multiple queries.',
			);
		},
	});
}

type LocalDbClientOptions = {
	dbUrl: string;
	enableTransactions: boolean;
};

export function createLocalDatabaseClient(options: LocalDbClientOptions): LibSQLDatabase {
	const url = isWebContainer ? 'file:content.db' : options.dbUrl;
	const client = createClient({ url });
	const db = drizzleLibsql(client);

	if (!options.enableTransactions) {
		applyTransactionNotSupported(db);
	}
	return db;
}

const remoteResultSchema = z.object({
	columns: z.array(z.string()),
	columnTypes: z.array(z.string()),
	rows: z.array(z.array(z.unknown())),
	rowsAffected: z.number(),
	lastInsertRowid: z.unknown().optional(),
});

type RemoteDbClientOptions = {
	dbType: 'studio' | 'libsql';
	appToken: string;
	remoteUrl: string | URL;
};

export function createRemoteDatabaseClient(options: RemoteDbClientOptions) {
	const remoteUrl = new URL(options.remoteUrl);

	return options.dbType === 'studio'
		? createStudioDatabaseClient(options.appToken, remoteUrl)
		: createRemoteLibSQLClient(options.appToken, remoteUrl, options.remoteUrl.toString());
}

function createRemoteLibSQLClient(appToken: string, remoteDbURL: URL, rawUrl: string) {
	const options: Partial<LibSQLConfig> = Object.fromEntries(remoteDbURL.searchParams.entries());
	remoteDbURL.search = '';

	let url = remoteDbURL.toString();
	if (remoteDbURL.protocol === 'memory:') {
		// libSQL expects a special string in place of a URL
		// for in-memory DBs.
		url = ':memory:';
	} else if (
		remoteDbURL.protocol === 'file:' &&
		remoteDbURL.pathname.startsWith('/') &&
		!rawUrl.startsWith('file:/')
	) {
		// libSQL accepts relative and absolute file URLs
		// for local DBs. This doesn't match the URL specification.
		// Parsing `file:some.db` and `file:/some.db` should yield
		// the same result, but libSQL interprets the former as
		// a relative path, and the latter as an absolute path.
		// This detects when such a conversion happened during parsing
		// and undoes it so that the URL given to libSQL is the
		// same as given by the user.
		url = 'file:' + remoteDbURL.pathname.substring(1);
	}

	const client = createClient({
		...options,
		authToken: appToken,
		url,
	});
	return drizzleLibsql(client);
}

function createStudioDatabaseClient(appToken: string, remoteDbURL: URL) {
	if (appToken == null) {
		throw new Error(`Cannot create a remote client: missing app token.`);
	}

	const url = new URL('/db/query', remoteDbURL);

	const db = drizzleProxy(
		async (sql, parameters, method) => {
			const requestBody: InStatement = { sql, args: parameters };
			const res = await safeFetch(
				url,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${appToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(requestBody),
				},
				async (response) => {
					throw await parseRemoteError(response);
				},
			);

			let remoteResult: z.infer<typeof remoteResultSchema>;
			try {
				const json = await res.json();
				remoteResult = remoteResultSchema.parse(json);
			} catch {
				throw new DetailedLibsqlError({
					message: await getUnexpectedResponseMessage(res),
					code: KNOWN_ERROR_CODES.SQL_QUERY_FAILED,
				});
			}

			if (method === 'run') {
				const rawRows = Array.from(remoteResult.rows);
				// Implement basic `toJSON()` for Drizzle to serialize properly
				(remoteResult as any).rows.toJSON = () => rawRows;
				// Using `db.run()` drizzle massages the rows into an object.
				// So in order to make dev/prod consistent, we need to do the same here.
				// This creates an object and loops over each row replacing it with the object.
				for (let i = 0; i < remoteResult.rows.length; i++) {
					let row = remoteResult.rows[i];
					let item: Record<string, any> = {};
					remoteResult.columns.forEach((col, index) => {
						item[col] = row[index];
					});
					(remoteResult as any).rows[i] = item;
				}
				return remoteResult;
			}

			// Drizzle expects each row as an array of its values
			const rowValues: unknown[][] = [];

			for (const row of remoteResult.rows) {
				if (row != null && typeof row === 'object') {
					rowValues.push(Object.values(row));
				}
			}

			if (method === 'get') {
				return { rows: rowValues[0] };
			}

			return { rows: rowValues };
		},
		async (queries) => {
			const stmts: InStatement[] = queries.map(({ sql, params }) => ({ sql, args: params }));
			const res = await safeFetch(
				url,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${appToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(stmts),
				},
				async (response) => {
					throw await parseRemoteError(response);
				},
			);

			let remoteResults: z.infer<typeof remoteResultSchema>[];
			try {
				const json = await res.json();
				remoteResults = z.array(remoteResultSchema).parse(json);
			} catch {
				throw new DetailedLibsqlError({
					message: await getUnexpectedResponseMessage(res),
					code: KNOWN_ERROR_CODES.SQL_QUERY_FAILED,
				});
			}
			let results: any[] = [];
			for (const [idx, rawResult] of remoteResults.entries()) {
				if (queries[idx]?.method === 'run') {
					results.push(rawResult);
					continue;
				}

				// Drizzle expects each row as an array of its values
				const rowValues: unknown[][] = [];

				for (const row of rawResult.rows) {
					if (row != null && typeof row === 'object') {
						rowValues.push(Object.values(row));
					}
				}

				if (queries[idx]?.method === 'get') {
					results.push({ rows: rowValues[0] });
				}

				results.push({ rows: rowValues });
			}
			return results;
		},
	);
	applyTransactionNotSupported(db);
	return db;
}

const errorSchema = z.object({
	success: z.boolean(),
	error: z.object({
		code: z.string(),
		details: z.string().optional(),
	}),
});

const KNOWN_ERROR_CODES = {
	SQL_QUERY_FAILED: 'SQL_QUERY_FAILED',
};

const getUnexpectedResponseMessage = async (response: Response) =>
	`Unexpected response from remote database:\n(Status ${response.status}) ${await response
		.clone()
		.text()}`;

async function parseRemoteError(response: Response): Promise<DetailedLibsqlError> {
	let error;
	try {
		error = errorSchema.parse(await response.clone().json()).error;
	} catch {
		return new DetailedLibsqlError({
			message: await getUnexpectedResponseMessage(response),
			code: KNOWN_ERROR_CODES.SQL_QUERY_FAILED,
		});
	}
	// Strip LibSQL error prefixes
	let baseDetails =
		error.details?.replace(/.*SQLite error: /, '') ?? 'Error querying remote database.';
	// Remove duplicated "code" in details
	const details = baseDetails.slice(baseDetails.indexOf(':') + 1).trim();
	let hint = `See the Astro DB guide for query and push instructions: https://docs.astro.build/en/guides/astro-db/#query-your-database`;
	if (error.code === KNOWN_ERROR_CODES.SQL_QUERY_FAILED && details.includes('no such table')) {
		hint = `Did you run \`astro db push\` to push your latest table schemas?`;
	}
	return new DetailedLibsqlError({ message: details, code: error.code, hint });
}

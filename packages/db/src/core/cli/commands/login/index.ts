import { mkdir, writeFile } from 'node:fs/promises';
import { createServer as _createServer } from 'node:http';
import { SESSION_LOGIN_FILE, getAstroStudioUrl } from '@astrojs/studio';
import type { AstroConfig } from 'astro';
import { listen } from 'async-listen';
import { cyan } from 'kleur/colors';
import open from 'open';
import prompt from 'prompts';
import type { Arguments } from 'yargs-parser';
import yoctoSpinner from 'yocto-spinner';
import type { DBConfig } from '../../../types.js';

const isWebContainer =
	// Stackblitz heuristic
	process.versions?.webcontainer ??
	// GitHub Codespaces heuristic
	process.env.CODESPACE_NAME;

export async function cmd({
	flags,
}: {
	astroConfig: AstroConfig;
	dbConfig: DBConfig;
	flags: Arguments;
}) {
	let session = flags.session;

	if (!session && isWebContainer) {
		console.log(`Please visit the following URL in your web browser:`);
		console.log(cyan(`${getAstroStudioUrl()}/auth/cli/login`));
		console.log(`After login in complete, enter the verification code displayed:`);
		const response = await prompt({
			type: 'text',
			name: 'session',
			message: 'Verification code:',
		});
		if (!response.session) {
			console.error('Cancelling login.');
			process.exit(0);
		}
		session = response.session;
		console.log('Successfully logged in');
	} else if (!session) {
		const { url, promise } = await createServer();
		const loginUrl = new URL('/auth/cli/login', getAstroStudioUrl());
		loginUrl.searchParams.set('returnTo', url);
		console.log(`Opening the following URL in your browser...`);
		console.log(cyan(loginUrl.href));
		console.log(`If something goes wrong, copy-and-paste the URL into your browser.`);
		open(loginUrl.href);
		const spinner = yoctoSpinner({ text: 'Waiting for confirmation...' });
		session = await promise;
		spinner.success('Successfully logged in');
	}

	await mkdir(new URL('.', SESSION_LOGIN_FILE), { recursive: true });
	await writeFile(SESSION_LOGIN_FILE, `${session}`);
}

// NOTE(fks): How the Astro CLI login process works:
// 1. The Astro CLI creates a temporary server to listen for the session token
// 2. The user is directed to studio.astro.build/ to login
// 3. The user is redirected back to the temporary server with their session token
// 4. The temporary server receives and saves the session token, logging the user in
// 5. The user is redirected one last time to a success/failure page
async function createServer(): Promise<{ url: string; promise: Promise<string> }> {
	let resolve: (value: string | PromiseLike<string>) => void, reject: (reason?: Error) => void;

	const server = _createServer((req, res) => {
		// Handle the request
		const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
		const sessionParam = url.searchParams.get('session');
		// Handle the response & resolve the promise
		res.statusCode = 302;
		if (!sessionParam) {
			res.setHeader('location', getAstroStudioUrl() + '/auth/cli/error');
			reject(new Error('Failed to log in'));
		} else {
			res.setHeader('location', getAstroStudioUrl() + '/auth/cli/success');
			resolve(sessionParam);
		}
		res.end();
	});

	const { port } = await listen(server, 0, '127.0.0.1');
	const serverUrl = `http://localhost:${port}`;
	const sessionPromise = new Promise<string>((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	}).finally(() => {
		server.closeAllConnections();
		server.close();
	});

	return { url: serverUrl, promise: sessionPromise };
}

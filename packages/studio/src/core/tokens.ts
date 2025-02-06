import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ci from 'ci-info';
import { green } from 'kleur/colors';
import yoctoSpinner from 'yocto-spinner';
import {
	MISSING_PROJECT_ID_ERROR,
	MISSING_SESSION_ID_CI_ERROR,
	MISSING_SESSION_ID_ERROR,
} from './errors.js';
import { getAstroStudioEnv, getAstroStudioUrl } from './utils.js';

export const SESSION_LOGIN_FILE = pathToFileURL(join(homedir(), '.astro', 'session-token'));
export const PROJECT_ID_FILE = pathToFileURL(join(process.cwd(), '.astro', 'link'));

export interface ManagedAppToken {
	token: string;
	renew(): Promise<void>;
	destroy(): Promise<void>;
}

class ManagedLocalAppToken implements ManagedAppToken {
	token: string;
	constructor(token: string) {
		this.token = token;
	}
	async renew() {}
	async destroy() {}
}

class ManagedRemoteAppToken implements ManagedAppToken {
	token: string;
	session: string;
	projectId: string;
	ttl: number;
	expires: Date;
	renewTimer: NodeJS.Timeout | undefined;

	static async create(sessionToken: string, projectId: string) {
		const { token: shortLivedAppToken, ttl } = await this.createToken(sessionToken, projectId);
		return new ManagedRemoteAppToken({
			token: shortLivedAppToken,
			session: sessionToken,
			projectId,
			ttl,
		});
	}

	static async createToken(
		sessionToken: string,
		projectId: string,
	): Promise<{ token: string; ttl: number }> {
		const spinner = yoctoSpinner({ text: 'Connecting to remote database...' }).start();
		const response = await safeFetch(
			new URL(`${getAstroStudioUrl()}/auth/cli/token-create`),
			{
				method: 'POST',
				headers: new Headers({
					Authorization: `Bearer ${sessionToken}`,
				}),
				body: JSON.stringify({ projectId }),
			},
			(res) => {
				throw new Error(`Failed to create token: ${res.status} ${res.statusText}`);
			},
		);
		spinner.success(green('Connected to remote database.'));

		const { token, ttl } = await response.json();
		return { token, ttl };
	}

	constructor(options: { token: string; session: string; projectId: string; ttl: number }) {
		this.token = options.token;
		this.session = options.session;
		this.projectId = options.projectId;
		this.ttl = options.ttl;
		this.renewTimer = setTimeout(() => this.renew(), (1000 * 60 * 5) / 2);
		this.expires = getExpiresFromTtl(this.ttl);
	}

	private async fetch(url: string, body: Record<string, unknown>) {
		return safeFetch(
			`${getAstroStudioUrl()}${url}`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.session}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			},
			() => {
				throw new Error(`Failed to fetch ${url}.`);
			},
		);
	}

	tokenIsValid() {
		return new Date() > this.expires;
	}

	createRenewTimer() {
		return setTimeout(() => this.renew(), (1000 * 60 * this.ttl) / 2);
	}

	async renew() {
		clearTimeout(this.renewTimer);
		delete this.renewTimer;

		if (this.tokenIsValid()) {
			const response = await this.fetch('/auth/cli/token-renew', {
				token: this.token,
				projectId: this.projectId,
			});
			if (response.status === 200) {
				this.expires = getExpiresFromTtl(this.ttl);
				this.renewTimer = this.createRenewTimer();
			} else {
				throw new Error(`Unexpected response: ${response.status} ${response.statusText}`);
			}
		} else {
			try {
				const { token, ttl } = await ManagedRemoteAppToken.createToken(
					this.session,
					this.projectId,
				);
				this.token = token;
				this.ttl = ttl;
				this.expires = getExpiresFromTtl(ttl);
				this.renewTimer = this.createRenewTimer();
			} catch {
				// If we get here we couldn't create a new token. Since the existing token
				// is expired we really can't do anything and should exit.
				throw new Error(
					`Token has expired and attempts to renew it have failed, please try again.`,
				);
			}
		}
	}

	async destroy() {
		try {
			const response = await this.fetch('/auth/cli/token-delete', {
				token: this.token,
				projectId: this.projectId,
			});
			if (response.status !== 200) {
				throw new Error(`Unexpected response: ${response.status} ${response.statusText}`);
			}
		} catch (error: any) {
			console.error('Failed to delete token.', error?.message);
		}
	}
}

export async function getProjectIdFromFile() {
	try {
		return await readFile(PROJECT_ID_FILE, 'utf-8');
	} catch {
		return undefined;
	}
}

export async function getSessionIdFromFile() {
	try {
		return await readFile(SESSION_LOGIN_FILE, 'utf-8');
	} catch {
		return undefined;
	}
}

export async function getManagedAppTokenOrExit(token?: string): Promise<ManagedAppToken> {
	if (token) {
		return new ManagedLocalAppToken(token);
	}
	if (process.env.ASTRO_INTERNAL_TEST_REMOTE) {
		return new ManagedLocalAppToken('fake' /* token ignored in test */);
	}
	const { ASTRO_STUDIO_APP_TOKEN } = getAstroStudioEnv();
	if (ASTRO_STUDIO_APP_TOKEN) {
		return new ManagedLocalAppToken(ASTRO_STUDIO_APP_TOKEN);
	}
	const sessionToken = await getSessionIdFromFile();
	if (!sessionToken) {
		if (ci.isCI) {
			console.error(MISSING_SESSION_ID_CI_ERROR);
		} else {
			console.error(MISSING_SESSION_ID_ERROR);
		}
		process.exit(1);
	}
	const projectId = await getProjectIdFromFile();
	if (!projectId) {
		console.error(MISSING_PROJECT_ID_ERROR);
		process.exit(1);
	}
	return ManagedRemoteAppToken.create(sessionToken, projectId);
}

function getExpiresFromTtl(ttl: number): Date {
	// ttl is in minutes
	return new Date(Date.now() + ttl * 60 * 1000);
}

/**
 * Small wrapper around fetch that throws an error if the response is not OK. Allows for custom error handling as well through the onNotOK callback.
 */
async function safeFetch(
	url: Parameters<typeof fetch>[0],
	options: Parameters<typeof fetch>[1] = {},
	onNotOK: (response: Response) => void | Promise<void> = () => {
		throw new Error(`Request to ${url} returned a non-OK status code.`);
	},
): Promise<Response> {
	const response = await fetch(url, options);

	if (!response.ok) {
		await onNotOK(response);
	}

	return response;
}

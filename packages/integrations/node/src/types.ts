import type { IncomingMessage, ServerResponse } from 'node:http';
import type { SSRManifest } from 'astro';
import type { NodeApp } from 'astro/app/node';

export interface UserOptions {
	/**
	 * Specifies the mode that the adapter builds to.
	 *
	 * - 'middleware' - Build to middleware, to be used within another Node.js server, such as Express.
	 * - 'standalone' - Build to a standalone server. The server starts up just by running the built script.
	 */
	mode: 'middleware' | 'standalone';
}

export interface Options extends UserOptions {
	host: string | boolean;
	port: number;
	server: string;
	client: string;
	assets: string;
	trailingSlash?: SSRManifest['trailingSlash'];
}

export interface CreateServerOptions {
	app: NodeApp;
	assets: string;
	client: URL;
	port: number;
	host: string | undefined;
	removeBase: (pathname: string) => string;
}

export type RequestHandler = (...args: RequestHandlerParams) => void | Promise<void>;
export type RequestHandlerParams = [
	req: IncomingMessage,
	res: ServerResponse,
	next?: (err?: unknown) => void,
	locals?: object,
];

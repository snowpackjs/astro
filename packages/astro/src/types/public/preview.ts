import type { OutgoingHttpHeaders } from 'node:http';
import type { AstroIntegrationLogger } from '../../core/logger/core.js';

export interface PreviewServer {
	host?: string;
	port: number;
	closed(): Promise<void>;
	stop(): Promise<void>;
}

export interface PreviewServerParams {
	outDir: URL;
	client: URL;
	serverEntrypoint: URL;
	host: string | undefined;
	port: number;
	base: string;
	logger: AstroIntegrationLogger;
	headers?: OutgoingHttpHeaders;
}

export type CreatePreviewServer = (
	params: PreviewServerParams,
) => PreviewServer | Promise<PreviewServer>;

export interface PreviewModule {
	default: CreatePreviewServer;
}

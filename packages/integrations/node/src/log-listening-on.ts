import type http from 'node:http';
import https from 'node:https';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import type { AstroIntegrationLogger } from 'astro';

const wildcardHosts = new Set(['0.0.0.0', '::', '0000:0000:0000:0000:0000:0000:0000:0000']);

export async function logListeningOn(
	logger: AstroIntegrationLogger,
	server: http.Server | https.Server,
	configuredHost: string | boolean | undefined,
) {
	await new Promise<void>((resolve) => server.once('listening', resolve));
	const protocol = server instanceof https.Server ? 'https' : 'http';
	// Allow to provide host value at runtime
	const host = getResolvedHostForHttpServer(configuredHost);
	const { port } = server.address() as AddressInfo;
	const address = getNetworkAddress(protocol, host, port);

	if (host === undefined || wildcardHosts.has(host)) {
		logger.info(
			`Server listening on \n  local: ${address.local[0]} \t\n  network: ${address.network[0]}\n`,
		);
	} else {
		logger.info(`Server listening on ${address.local[0]}`);
	}
}

function getResolvedHostForHttpServer(host: string | boolean | undefined) {
	if (host === false) {
		// Use a secure default
		return 'localhost';
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else if (host === true) {
		// If passed --host in the CLI without arguments
		return undefined; // undefined typically means 0.0.0.0 or :: (listen on all IPs)
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else {
		return host;
	}
}

interface NetworkAddressOpt {
	local: string[];
	network: string[];
}

// this code from vite https://github.com/vitejs/vite/blob/d09bbd093a4b893e78f0bbff5b17c7cf7821f403/packages/vite/src/node/utils.ts#L892-L914
export function getNetworkAddress(
	// biome-ignore lint/style/useDefaultParameterLast: <explanation>
	protocol: 'http' | 'https' = 'http',
	hostname: string | undefined,
	port: number,
	base?: string,
) {
	const NetworkAddress: NetworkAddressOpt = {
		local: [],
		network: [],
	};
	// biome-ignore lint/complexity/noForEach: <explanation>
	Object.values(os.networkInterfaces())
		.flatMap((nInterface) => nInterface ?? [])
		.filter(
			(detail) =>
				// biome-ignore lint/complexity/useOptionalChain: <explanation>
				detail &&
				detail.address &&
				(detail.family === 'IPv4' ||
					// @ts-expect-error Node 18.0 - 18.3 returns number
					detail.family === 4),
		)
		.forEach((detail) => {
			let host = detail.address.replace(
				'127.0.0.1',
				hostname === undefined || wildcardHosts.has(hostname) ? 'localhost' : hostname,
			);
			// ipv6 host
			if (host.includes(':')) {
				host = `[${host}]`;
			}
			const url = `${protocol}://${host}:${port}${base ? base : ''}`;
			if (detail.address.includes('127.0.0.1')) {
				NetworkAddress.local.push(url);
			} else {
				NetworkAddress.network.push(url);
			}
		});
	return NetworkAddress;
}

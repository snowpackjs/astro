import { isRemotePath } from '@astrojs/internal-helpers/path';
import type { AstroConfig } from '../../types/public/config.js';

export type RemotePattern = {
	hostname?: string;
	pathname?: string;
	protocol?: string;
	port?: string;
};

export function matchPattern(url: URL, remotePattern: RemotePattern) {
	return (
		matchProtocol(url, remotePattern.protocol) &&
		matchHostname(url, remotePattern.hostname, true) &&
		matchPort(url, remotePattern.port) &&
		matchPathname(url, remotePattern.pathname, true)
	);
}

export function matchPort(url: URL, port?: string) {
	return !port || port === url.port;
}

export function matchProtocol(url: URL, protocol?: string) {
	return !protocol || protocol === url.protocol.slice(0, -1);
}

export function matchHostname(url: URL, hostname?: string, allowWildcard?: boolean) {
	if (!hostname) {
		return true;
	} else if (!allowWildcard || !hostname.startsWith('*')) {
		return hostname === url.hostname;
	} else if (hostname.startsWith('**.')) {
		const slicedHostname = hostname.slice(2); // ** length
		return slicedHostname !== url.hostname && url.hostname.endsWith(slicedHostname);
	} else if (hostname.startsWith('*.')) {
		const slicedHostname = hostname.slice(1); // * length
		const additionalSubdomains = url.hostname
			.replace(slicedHostname, '')
			.split('.')
			.filter(Boolean);
		return additionalSubdomains.length === 1;
	}

	return false;
}

export function matchPathname(url: URL, pathname?: string, allowWildcard?: boolean) {
	if (!pathname) {
		return true;
	} else if (!allowWildcard || !pathname.endsWith('*')) {
		return pathname === url.pathname;
	} else if (pathname.endsWith('/**')) {
		const slicedPathname = pathname.slice(0, -2); // ** length
		return slicedPathname !== url.pathname && url.pathname.startsWith(slicedPathname);
	} else if (pathname.endsWith('/*')) {
		const slicedPathname = pathname.slice(0, -1); // * length
		const additionalPathChunks = url.pathname
			.replace(slicedPathname, '')
			.split('/')
			.filter(Boolean);
		return additionalPathChunks.length === 1;
	}

	return false;
}

export function isRemoteAllowed(
	src: string,
	{
		domains = [],
		remotePatterns = [],
	}: Partial<Pick<AstroConfig['image'], 'domains' | 'remotePatterns'>>,
): boolean {
	if (!isRemotePath(src)) return false;

	const url = new URL(src);
	return (
		domains.some((domain) => matchHostname(url, domain)) ||
		remotePatterns.some((remotePattern) => matchPattern(url, remotePattern))
	);
}

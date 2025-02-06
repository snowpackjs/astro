import os from 'node:os';
import { name as ciName, isCI } from 'ci-info';
import isDocker from 'is-docker';
import isWSL from 'is-wsl';

/**
 * Astro Telemetry -- System Info
 *
 * To better understand our telemetry insights, Astro collects the following anonymous information
 * about the system that it runs on. This helps us prioritize fixes and new features based on a
 * better understanding of our real-world system requirements.
 *
 * ~~~
 *
 * Q: Can this system info be traced back to me?
 *
 * A: No personally identifiable information is contained in the system info that we collect. It could
 * be possible for someone with direct access to your machine to collect this information themselves
 * and then attempt to match it all together with our collected telemetry data, however most users'
 * systems are probably not uniquely identifiable via their system info alone.
 *
 * ~~~
 *
 * Q: I don't want Astro to collect system info. How can I disable it?
 *
 * A: You can disable telemetry completely at any time by running `astro telemetry disable`. There is
 * currently no way to disable this otherwise while keeping the rest of telemetry enabled.
 */

export type SystemInfo = {
	systemPlatform: NodeJS.Platform;
	systemRelease: string;
	systemArchitecture: string;
	astroVersion: string;
	nodeVersion: string;
	viteVersion: string;
	cpuCount: number;
	cpuModel: string | null;
	cpuSpeed: number | null;
	memoryInMb: number;
	isDocker: boolean;
	isTTY: boolean;
	isWSL: boolean;
	isCI: boolean;
	ciName: string | null;
};

let meta: SystemInfo | undefined;

export function getSystemInfo(versions: { viteVersion: string; astroVersion: string }): SystemInfo {
	if (meta) {
		return meta;
	}

	const cpus = os.cpus() || [];

	return {
		// Version information
		nodeVersion: process.version.replace(/^v?/, ''),
		viteVersion: versions.viteVersion,
		astroVersion: versions.astroVersion,
		// Software information
		systemPlatform: os.platform(),
		systemRelease: os.release(),
		systemArchitecture: os.arch(),
		// Machine information
		cpuCount: cpus.length,
		cpuModel: cpus.length ? cpus[0].model : null,
		cpuSpeed: cpus.length ? cpus[0].speed : null,
		memoryInMb: Math.trunc(os.totalmem() / Math.pow(1024, 2)),
		// Environment information
		isDocker: isDocker(),
		isTTY: process.stdout.isTTY,
		isWSL,
		isCI,
		ciName,
	};
}

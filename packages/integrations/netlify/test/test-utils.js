import { execa } from 'execa';

/** Returns a process running the Astro CLI. */
export function cli(/** @type {string[]} */ ...args) {
	const spawned = execa('npx', ['astro', ...args], {
		env: { ASTRO_TELEMETRY_DISABLED: true },
	});

	spawned.stdout.setEncoding('utf8');

	return spawned;
}

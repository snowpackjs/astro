import buffer from 'node:buffer';
import crypto from 'node:crypto';

/**
 * Astro aims to compatible with web standards as much as possible.
 * This function adds two objects that are globally-available on most javascript runtimes but not on node 18.
 */
export function apply() {
	// Remove when Node 18 is dropped for Node 20
	if (!globalThis.crypto) {
		Object.defineProperty(globalThis, 'crypto', {
			value: crypto.webcrypto,
		});
	}

	// Remove when Node 18 is dropped for Node 20
	if (!globalThis.File) {
		Object.defineProperty(globalThis, 'File', {
			value: buffer.File,
		});
	}
}

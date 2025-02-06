import { createNodeLogger } from '../../core/config/logging.js';
import { createKey as createCryptoKey, encodeKey } from '../../core/encryption.js';
import { type Flags, flagsToAstroInlineConfig } from '../flags.js';

interface CreateKeyOptions {
	flags: Flags;
}

export async function createKey({ flags }: CreateKeyOptions): Promise<0 | 1> {
	try {
		const inlineConfig = flagsToAstroInlineConfig(flags);
		const logger = createNodeLogger(inlineConfig);

		const keyPromise = createCryptoKey();
		const key = await keyPromise;
		const encoded = await encodeKey(key);

		logger.info(
			'crypto',
			`Generated a key to encrypt props passed to Server islands. To reuse the same key across builds, set this value as ASTRO_KEY in an environment variable on your build server.

ASTRO_KEY=${encoded}`,
		);
	} catch (err: unknown) {
		if (err != null) {
			console.error(err.toString());
		}
		return 1;
	}

	return 0;
}

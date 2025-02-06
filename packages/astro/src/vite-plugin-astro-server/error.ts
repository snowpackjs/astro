import type { ModuleLoader } from '../core/module-loader/index.js';
import type { DevPipeline } from './pipeline.js';

import { collectErrorMetadata } from '../core/errors/dev/index.js';
import { createSafeError } from '../core/errors/index.js';
import { formatErrorMessage } from '../core/messages.js';
import type { AstroConfig } from '../types/public/config.js';

export function recordServerError(
	loader: ModuleLoader,
	config: AstroConfig,
	{ logger }: DevPipeline,
	_err: unknown,
) {
	const err = createSafeError(_err);

	// This could be a runtime error from Vite's SSR module, so try to fix it here
	try {
		loader.fixStacktrace(err);
	} catch {}

	// This is our last line of defense regarding errors where we still might have some information about the request
	// Our error should already be complete, but let's try to add a bit more through some guesswork
	const errorWithMetadata = collectErrorMetadata(err, config.root);

	logger.error(null, formatErrorMessage(errorWithMetadata, logger.level() === 'debug'));

	return {
		error: err,
		errorWithMetadata,
	};
}

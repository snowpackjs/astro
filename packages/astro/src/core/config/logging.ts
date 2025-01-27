import type { AstroInlineConfig } from '../../types/public/config.js';
import { Logger } from '../logger/core.js';
import { nodeLogDestination } from '../logger/node.js';

export function createNodeLogger(inlineConfig: AstroInlineConfig): Logger {
	if (inlineConfig.logger) return inlineConfig.logger;

	return new Logger({
		dest: nodeLogDestination,
		level: inlineConfig.logLevel ?? 'info',
	});
}

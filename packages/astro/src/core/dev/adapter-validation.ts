import { getAdapterStaticRecommendation } from '../../integrations/features-validation.js';
import type { AstroSettings } from '../../types/astro.js';
import type { AstroAdapter } from '../../types/public/integrations.js';
import { AstroError, AstroErrorData } from '../errors/index.js';
import type { Logger } from '../logger/core.js';

let hasWarnedMissingAdapter = false;

export function warnMissingAdapter(logger: Logger, settings: AstroSettings) {
	if (hasWarnedMissingAdapter) return;
	if (settings.buildOutput === 'server' && !settings.config.adapter) {
		logger.warn(
			'config',
			'This project contains server-rendered routes, but no adapter is installed. This is fine for development, but an adapter will be required to build your site for production.',
		);
		hasWarnedMissingAdapter = true;
	}
}

export function validateSetAdapter(
	logger: Logger,
	settings: AstroSettings,
	adapter: AstroAdapter,
	maybeConflictingIntegration: string,
	command?: 'dev' | 'build' | string,
) {
	if (settings.adapter && settings.adapter.name !== adapter.name) {
		throw new Error(
			`Integration "${maybeConflictingIntegration}" conflicts with "${settings.adapter.name}". You can only configure one deployment integration.`,
		);
	}

	if (settings.buildOutput === 'server' && adapter.adapterFeatures?.buildOutput === 'static') {
		// If the adapter is not compatible with the build output, throw an error
		if (command === 'build') {
			const adapterRecommendation = getAdapterStaticRecommendation(adapter.name);

			throw new AstroError({
				...AstroErrorData.AdapterSupportOutputMismatch,
				message: AstroErrorData.AdapterSupportOutputMismatch.message(adapter.name),
				hint: adapterRecommendation ? adapterRecommendation : undefined,
			});
		} else if (command === 'dev') {
			logger.warn(
				null,
				`The adapter ${adapter.name} does not support emitting a server output, but the project contain server-rendered pages. Your project will not build correctly.`,
			);
		}
	}
}

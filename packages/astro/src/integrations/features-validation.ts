import type { Logger } from '../core/logger/core.js';
import type { AstroSettings } from '../types/astro.js';
import type {
	AdapterSupport,
	AdapterSupportsKind,
	AstroAdapterFeatureMap,
} from '../types/public/integrations.js';

export const AdapterFeatureStability = {
	STABLE: 'stable',
	DEPRECATED: 'deprecated',
	UNSUPPORTED: 'unsupported',
	EXPERIMENTAL: 'experimental',
	LIMITED: 'limited',
} as const;

type ValidationResult = {
	[Property in keyof AstroAdapterFeatureMap]: boolean;
};

/**
 * Checks whether an adapter supports certain features that are enabled via Astro configuration.
 *
 * If a configuration is enabled and "unlocks" a feature, but the adapter doesn't support, the function
 * will throw a runtime error.
 *
 */
export function validateSupportedFeatures(
	adapterName: string,
	featureMap: AstroAdapterFeatureMap,
	settings: AstroSettings,
	logger: Logger,
): ValidationResult {
	const {
		serverOutput = AdapterFeatureStability.UNSUPPORTED,
		staticOutput = AdapterFeatureStability.UNSUPPORTED,
		hybridOutput = AdapterFeatureStability.UNSUPPORTED,
		i18nDomains = AdapterFeatureStability.UNSUPPORTED,
		envGetSecret = AdapterFeatureStability.UNSUPPORTED,
		sharpImageService = AdapterFeatureStability.UNSUPPORTED,
	} = featureMap;
	const validationResult: ValidationResult = {};

	validationResult.staticOutput = validateSupportKind(
		staticOutput,
		adapterName,
		logger,
		'staticOutput',
		() => settings.buildOutput === 'static',
	);

	validationResult.hybridOutput = validateSupportKind(
		hybridOutput,
		adapterName,
		logger,
		'hybridOutput',
		() => settings.config.output == 'static' && settings.buildOutput === 'server',
	);

	validationResult.serverOutput = validateSupportKind(
		serverOutput,
		adapterName,
		logger,
		'serverOutput',
		() => settings.config?.output === 'server' || settings.buildOutput === 'server',
	);

	if (settings.config.i18n?.domains) {
		validationResult.i18nDomains = validateSupportKind(
			i18nDomains,
			adapterName,
			logger,
			'i18nDomains',
			() => {
				return settings.config?.output === 'server' && !settings.config?.site;
			},
		);
	}

	validationResult.envGetSecret = validateSupportKind(
		envGetSecret,
		adapterName,
		logger,
		'astro:env getSecret',
		() => Object.keys(settings.config?.env?.schema ?? {}).length !== 0,
	);

	validationResult.sharpImageService = validateSupportKind(
		sharpImageService,
		adapterName,
		logger,
		'sharp',
		() => settings.config?.image?.service?.entrypoint === 'astro/assets/services/sharp',
	);

	return validationResult;
}

export function unwrapSupportKind(supportKind?: AdapterSupport): AdapterSupportsKind | undefined {
	if (!supportKind) {
		return undefined;
	}

	return typeof supportKind === 'object' ? supportKind.support : supportKind;
}

export function getSupportMessage(supportKind: AdapterSupport): string | undefined {
	return typeof supportKind === 'object' ? supportKind.message : undefined;
}

function validateSupportKind(
	supportKind: AdapterSupport,
	adapterName: string,
	logger: Logger,
	featureName: string,
	hasCorrectConfig: () => boolean,
): boolean {
	const supportValue = unwrapSupportKind(supportKind);
	const message = getSupportMessage(supportKind);

	if (!supportValue) {
		return false;
	}

	if (supportValue === AdapterFeatureStability.STABLE) {
		return true;
	} else if (hasCorrectConfig()) {
		// If the user has the relevant configuration, but the adapter doesn't support it, warn the user
		logFeatureSupport(adapterName, logger, featureName, supportValue, message);
	}

	return false;
}

function logFeatureSupport(
	adapterName: string,
	logger: Logger,
	featureName: string,
	supportKind: AdapterSupport,
	adapterMessage?: string,
) {
	switch (supportKind) {
		case AdapterFeatureStability.STABLE:
			break;
		case AdapterFeatureStability.DEPRECATED:
			logger.warn(
				'config',
				`The adapter ${adapterName} has deprecated its support for "${featureName}", and future compatibility is not guaranteed. The adapter may completely remove support for this feature without warning.`,
			);
			break;
		case AdapterFeatureStability.EXPERIMENTAL:
			logger.warn(
				'config',
				`The adapter ${adapterName} provides experimental support for "${featureName}". You may experience issues or breaking changes until this feature is fully supported by the adapter.`,
			);
			break;
		case AdapterFeatureStability.LIMITED:
			logger.warn(
				'config',
				`The adapter ${adapterName} has limited support for "${featureName}". Certain features may not work as expected.`,
			);
			break;
		case AdapterFeatureStability.UNSUPPORTED:
			logger.error(
				'config',
				`The adapter ${adapterName} does not currently support the feature "${featureName}". Your project may not build correctly.`,
			);
			break;
	}

	// If the adapter specified a custom message, log it after the default message
	if (adapterMessage) {
		logger.warn('adapter', adapterMessage);
	}
}

export function getAdapterStaticRecommendation(adapterName: string): string | undefined {
	return {
		'@astrojs/vercel/static':
			'Update your configuration to use `@astrojs/vercel/serverless` to unlock server-side rendering capabilities.',
	}[adapterName];
}

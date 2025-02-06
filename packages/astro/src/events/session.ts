import { AstroConfigSchema } from '../core/config/schema.js';
import type { AstroUserConfig } from '../types/public/config.js';
import type { AstroIntegration } from '../types/public/integrations.js';

const EVENT_SESSION = 'ASTRO_CLI_SESSION_STARTED';

interface EventPayload {
	cliCommand: string;
	config?: ConfigInfo;
	configKeys?: string[];
	flags?: string[];
	optionalIntegrations?: number;
}

type ConfigInfoValue = string | boolean | string[] | undefined;
type ConfigInfoRecord = Record<string, ConfigInfoValue>;
type ConfigInfoBase = {
	[alias in keyof AstroUserConfig]: ConfigInfoValue | ConfigInfoRecord;
};
export interface ConfigInfo extends ConfigInfoBase {
	build: ConfigInfoRecord;
	image: ConfigInfoRecord;
	markdown: ConfigInfoRecord;
	experimental: ConfigInfoRecord;
	legacy: ConfigInfoRecord;
	vite: ConfigInfoRecord | undefined;
}

function measureIsDefined(val: unknown) {
	// if val is undefined, measure undefined as a value
	if (val === undefined) {
		return undefined;
	}
	// otherwise, convert the value to a boolean
	return Boolean(val);
}

type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;

/**
 * Measure supports string literal values. Passing a generic `string` type
 * results in an error, to make sure generic user input is never measured directly.
 */
function measureStringLiteral<T extends string>(
	val: StringLiteral<T> | boolean | undefined,
): string | boolean | undefined {
	return val;
}

function measureIntegration(val: AstroIntegration | false | null | undefined): string | undefined {
	if (!val || !val.name) {
		return undefined;
	}
	return val.name;
}

function sanitizeConfigInfo(obj: object | undefined, validKeys: string[]): ConfigInfoRecord {
	if (!obj || validKeys.length === 0) {
		return {};
	}
	return validKeys.reduce(
		(result, key) => {
			result[key] = measureIsDefined((obj as Record<string, unknown>)[key]);
			return result;
		},
		{} as Record<string, boolean | undefined>,
	);
}

/**
 * This function creates an anonymous ConfigInfo object from the user's config.
 * All values are sanitized to preserve anonymity. Simple "exist" boolean checks
 * are used by default, with a few additional sanitized values added manually.
 * Helper functions should always be used to ensure correct sanitization.
 */
function createAnonymousConfigInfo(userConfig: AstroUserConfig) {
	// Sanitize and measure the generic config object
	// NOTE(fks): Using _def is the correct, documented way to get the `shape`
	// from a Zod object that includes a wrapping default(), optional(), etc.
	// Even though `_def` appears private, it is type-checked for us so that
	// any changes between versions will be detected.
	const configInfo: ConfigInfo = {
		...sanitizeConfigInfo(userConfig, Object.keys(AstroConfigSchema.shape)),
		build: sanitizeConfigInfo(
			userConfig.build,
			Object.keys(AstroConfigSchema.shape.build._def.innerType.shape),
		),
		image: sanitizeConfigInfo(
			userConfig.image,
			Object.keys(AstroConfigSchema.shape.image._def.innerType.shape),
		),
		markdown: sanitizeConfigInfo(
			userConfig.markdown,
			Object.keys(AstroConfigSchema.shape.markdown._def.innerType.shape),
		),
		experimental: sanitizeConfigInfo(
			userConfig.experimental,
			Object.keys(AstroConfigSchema.shape.experimental._def.innerType.shape),
		),
		legacy: sanitizeConfigInfo(
			userConfig.legacy,
			Object.keys(AstroConfigSchema.shape.legacy._def.innerType.shape),
		),
		vite: userConfig.vite
			? sanitizeConfigInfo(userConfig.vite, Object.keys(userConfig.vite))
			: undefined,
	};
	// Measure string literal/enum configuration values
	configInfo.build.format = measureStringLiteral(userConfig.build?.format);
	configInfo.markdown.syntaxHighlight = measureStringLiteral(userConfig.markdown?.syntaxHighlight);
	configInfo.output = measureStringLiteral(userConfig.output);
	configInfo.scopedStyleStrategy = measureStringLiteral(userConfig.scopedStyleStrategy);
	configInfo.trailingSlash = measureStringLiteral(userConfig.trailingSlash);
	// Measure integration & adapter usage
	configInfo.adapter = measureIntegration(userConfig.adapter);
	configInfo.integrations = userConfig.integrations
		?.flat(100)
		.map(measureIntegration)
		.filter(Boolean) as string[];
	// Return the sanitized ConfigInfo object
	return configInfo;
}

export function eventCliSession(
	cliCommand: string,
	userConfig: AstroUserConfig,
	flags?: Record<string, any>,
): { eventName: string; payload: EventPayload }[] {
	// Filter out yargs default `_` flag which is the cli command
	const cliFlags = flags ? Object.keys(flags).filter((name) => name != '_') : undefined;

	const payload: EventPayload = {
		cliCommand,
		config: createAnonymousConfigInfo(userConfig),
		flags: cliFlags,
	};
	return [{ eventName: EVENT_SESSION, payload }];
}

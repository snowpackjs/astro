import { fileURLToPath } from 'node:url';
import { formatWithOptions } from 'node:util';
import dlv from 'dlv';
import { flattie } from 'flattie';
import { bgGreen, black, bold, dim, yellow } from 'kleur/colors';
import { resolveConfig } from '../../core/config/config.js';
import { createSettings } from '../../core/config/settings.js';
import { collectErrorMetadata } from '../../core/errors/dev/utils.js';
import * as msg from '../../core/messages.js';
import { apply as applyPolyfill } from '../../core/polyfill.js';
import { DEFAULT_PREFERENCES } from '../../preferences/defaults.js';
import { type PreferenceKey, coerce, isValidKey } from '../../preferences/index.js';
import type { AstroSettings } from '../../types/astro.js';
import { type Flags, createLoggerFromFlags, flagsToAstroInlineConfig } from '../flags.js';

interface PreferencesOptions {
	flags: Flags;
}

const PREFERENCES_SUBCOMMANDS = [
	'get',
	'set',
	'enable',
	'disable',
	'delete',
	'reset',
	'list',
] as const;
export type Subcommand = (typeof PREFERENCES_SUBCOMMANDS)[number];

type AnnotatedValue = { annotation: string; value: string | number | boolean };
type AnnotatedValues = Record<string, AnnotatedValue>;

function isValidSubcommand(subcommand: string): subcommand is Subcommand {
	return PREFERENCES_SUBCOMMANDS.includes(subcommand as Subcommand);
}

export async function preferences(
	subcommand: string,
	key: string,
	value: string | undefined,
	{ flags }: PreferencesOptions,
): Promise<number> {
	applyPolyfill();
	if (!isValidSubcommand(subcommand) || flags?.help || flags?.h) {
		msg.printHelp({
			commandName: 'astro preferences',
			usage: '[command]',
			tables: {
				Commands: [
					['list', 'Pretty print all current preferences'],
					['list --json', 'Log all current preferences as a JSON object'],
					['get [key]', 'Log current preference value'],
					['set [key] [value]', 'Update preference value'],
					['reset [key]', 'Reset preference value to default'],
					['enable [key]', 'Set a boolean preference to true'],
					['disable [key]', 'Set a boolean preference to false'],
				],
				Flags: [
					[
						'--global',
						'Scope command to global preferences (all Astro projects) rather than the current project',
					],
				],
			},
		});
		return 0;
	}

	const inlineConfig = flagsToAstroInlineConfig(flags);
	const logger = createLoggerFromFlags(flags);
	const { astroConfig } = await resolveConfig(inlineConfig ?? {}, 'dev');
	const settings = await createSettings(astroConfig, fileURLToPath(astroConfig.root));
	const opts: SubcommandOptions = {
		location: flags.global ? 'global' : undefined,
		json: !!flags.json,
	};

	if (subcommand === 'list') {
		return listPreferences(settings, opts);
	}

	if (subcommand === 'enable' || subcommand === 'disable') {
		key = `${key}.enabled` as PreferenceKey;
	}

	if (!isValidKey(key)) {
		logger.error('preferences', `Unknown preference "${key}"\n`);
		return 1;
	}

	if (subcommand === 'set' && value === undefined) {
		const type = typeof dlv(DEFAULT_PREFERENCES, key);
		console.error(
			msg.formatErrorMessage(
				collectErrorMetadata(new Error(`Please provide a ${type} value for "${key}"`)),
				true,
			),
		);
		return 1;
	}

	switch (subcommand) {
		case 'get':
			return getPreference(settings, key, opts);
		case 'set':
			return setPreference(settings, key, value, opts);
		case 'reset':
		case 'delete':
			return resetPreference(settings, key, opts);
		case 'enable':
			return enablePreference(settings, key, opts);
		case 'disable':
			return disablePreference(settings, key, opts);
	}
}

interface SubcommandOptions {
	location?: 'global' | 'project';
	json?: boolean;
}

// Default `location` to "project" to avoid reading default preferences
async function getPreference(
	settings: AstroSettings,
	key: PreferenceKey,
	{ location = 'project' }: SubcommandOptions,
) {
	try {
		let value = await settings.preferences.get(key, { location });
		if (value && typeof value === 'object' && !Array.isArray(value)) {
			if (Object.keys(value).length === 0) {
				value = dlv(DEFAULT_PREFERENCES, key);
				console.log(msg.preferenceDefaultIntro(key));
			}
			prettyPrint({ [key]: value });
			return 0;
		}
		if (value === undefined) {
			const defaultValue = await settings.preferences.get(key);
			console.log(msg.preferenceDefault(key, defaultValue));
			return 0;
		}
		console.log(msg.preferenceGet(key, value));
		return 0;
	} catch {}
	return 1;
}

async function setPreference(
	settings: AstroSettings,
	key: PreferenceKey,
	value: unknown,
	{ location }: SubcommandOptions,
) {
	try {
		const defaultType = typeof dlv(DEFAULT_PREFERENCES, key);
		if (typeof coerce(key, value) !== defaultType) {
			throw new Error(`${key} expects a "${defaultType}" value!`);
		}

		await settings.preferences.set(key, coerce(key, value), { location });
		console.log(msg.preferenceSet(key, value));
		return 0;
	} catch (e) {
		if (e instanceof Error) {
			console.error(msg.formatErrorMessage(collectErrorMetadata(e), true));
			return 1;
		}
		throw e;
	}
}

async function enablePreference(
	settings: AstroSettings,
	key: PreferenceKey,
	{ location }: SubcommandOptions,
) {
	try {
		await settings.preferences.set(key, true, { location });
		console.log(msg.preferenceEnabled(key.replace('.enabled', '')));
		return 0;
	} catch {}
	return 1;
}

async function disablePreference(
	settings: AstroSettings,
	key: PreferenceKey,
	{ location }: SubcommandOptions,
) {
	try {
		await settings.preferences.set(key, false, { location });
		console.log(msg.preferenceDisabled(key.replace('.enabled', '')));
		return 0;
	} catch {}
	return 1;
}

async function resetPreference(
	settings: AstroSettings,
	key: PreferenceKey,
	{ location }: SubcommandOptions,
) {
	try {
		await settings.preferences.set(key, undefined as any, { location });
		console.log(msg.preferenceReset(key));
		return 0;
	} catch {}
	return 1;
}

function annotate(flat: Record<string, any>, annotation: string) {
	return Object.fromEntries(
		Object.entries(flat).map(([key, value]) => [key, { annotation, value }]),
	);
}
function userValues(
	flatDefault: Record<string, string | number | boolean>,
	flatProject: Record<string, string | number | boolean>,
	flatGlobal: Record<string, string | number | boolean>,
) {
	const result: AnnotatedValues = {};
	for (const key of Object.keys(flatDefault)) {
		if (key in flatProject) {
			result[key] = {
				value: flatProject[key],
				annotation: '',
			};
			if (key in flatGlobal) {
				result[key].annotation += ` (also modified globally)`;
			}
		} else if (key in flatGlobal) {
			result[key] = { value: flatGlobal[key], annotation: '(global)' };
		}
	}
	return result;
}

async function listPreferences(settings: AstroSettings, { location, json }: SubcommandOptions) {
	if (json) {
		const resolved = await settings.preferences.getAll();
		console.log(JSON.stringify(resolved, null, 2));
		return 0;
	}
	const { global, project, fromAstroConfig, defaults } = await settings.preferences.list({
		location,
	});
	const flatProject = flattie(project);
	const flatGlobal = flattie(global);
	const flatDefault = flattie(defaults);
	const flatUser = userValues(flatDefault, flatProject, flatGlobal);

	const userKeys = Object.keys(flatUser);

	if (userKeys.length > 0) {
		const badge = bgGreen(black(` Your Preferences `));
		const table = formatTable(flatUser, ['Preference', 'Value']);

		console.log(['', badge, table].join('\n'));
	} else {
		const badge = bgGreen(black(` Your Preferences `));
		const message = dim('No preferences set');
		console.log(['', badge, '', message].join('\n'));
	}
	const flatUnset = annotate(Object.assign({}, flatDefault), '');
	for (const key of userKeys) {
		delete flatUnset[key];
	}
	const unsetKeys = Object.keys(flatUnset);

	if (unsetKeys.length > 0) {
		const badge = bgGreen(black(` Default Preferences `));
		const table = formatTable(flatUnset, ['Preference', 'Value']);

		console.log(['', badge, table].join('\n'));
	} else {
		const badge = bgGreen(black(` Default Preferences `));
		const message = dim('All preferences have been set');
		console.log(['', badge, '', message].join('\n'));
	}
	if (
		fromAstroConfig.devToolbar?.enabled === false &&
		flatUser['devToolbar.enabled']?.value !== false
	) {
		console.log(
			yellow(
				'The dev toolbar is currently disabled. To enable it, set devToolbar: {enabled: true} in your astroConfig file.',
			),
		);
	}

	return 0;
}

function prettyPrint(value: Record<string, string | number | boolean>) {
	const flattened = flattie(value);
	const table = formatTable(flattened, ['Preference', 'Value']);
	console.log(table);
}

const chars = {
	h: '─',
	hThick: '━',
	hThickCross: '┿',
	v: '│',
	vRight: '├',
	vRightThick: '┝',
	vLeft: '┤',
	vLeftThick: '┥',
	hTop: '┴',
	hBottom: '┬',
	topLeft: '╭',
	topRight: '╮',
	bottomLeft: '╰',
	bottomRight: '╯',
};

// this is only used to determine the column width
function annotatedFormat(mv: AnnotatedValue) {
	return mv.annotation ? `${mv.value} ${mv.annotation}` : mv.value.toString();
}
// this is the real formatting for annotated values
function formatAnnotated(
	mv: AnnotatedValue,
	style: (value: string | number | boolean) => string = (v) => v.toString(),
) {
	return mv.annotation ? `${style(mv.value)} ${dim(mv.annotation)}` : style(mv.value);
}
function formatTable(object: Record<string, AnnotatedValue>, columnLabels: [string, string]) {
	const [colA, colB] = columnLabels;
	const colALength = [colA, ...Object.keys(object)].reduce(longest, 0) + 3;
	const colBLength = [colB, ...Object.values(object).map(annotatedFormat)].reduce(longest, 0) + 3;
	function formatRow(
		_i: number,
		a: string,
		b: AnnotatedValue,
		style: (value: string | number | boolean) => string = (v) => v.toString(),
	): string {
		return `${dim(chars.v)} ${style(a)} ${space(colALength - a.length - 2)} ${dim(
			chars.v,
		)} ${formatAnnotated(b, style)} ${space(colBLength - annotatedFormat(b).length - 3)} ${dim(
			chars.v,
		)}`;
	}
	const top = dim(
		`${chars.topLeft}${chars.h.repeat(colALength + 1)}${chars.hBottom}${chars.h.repeat(
			colBLength,
		)}${chars.topRight}`,
	);
	const bottom = dim(
		`${chars.bottomLeft}${chars.h.repeat(colALength + 1)}${chars.hTop}${chars.h.repeat(
			colBLength,
		)}${chars.bottomRight}`,
	);
	const divider = dim(
		`${chars.vRightThick}${chars.hThick.repeat(colALength + 1)}${
			chars.hThickCross
		}${chars.hThick.repeat(colBLength)}${chars.vLeftThick}`,
	);
	const rows: string[] = [top, formatRow(-1, colA, { value: colB, annotation: '' }, bold), divider];
	let i = 0;
	for (const [key, value] of Object.entries(object)) {
		rows.push(formatRow(i, key, value, (v) => formatWithOptions({ colors: true }, v)));
		i++;
	}
	rows.push(bottom);
	return rows.join('\n');
}

function space(len: number) {
	return ' '.repeat(len);
}

const longest = (a: number, b: string | number | boolean) => {
	const { length: len } = b.toString();
	return a > len ? a : len;
};

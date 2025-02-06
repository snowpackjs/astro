import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import dget from 'dlv';
import type { AstroConfig } from '../types/public/config.js';
import { DEFAULT_PREFERENCES, type Preferences, type PublicPreferences } from './defaults.js';
import { PreferenceStore } from './store.js';

type DotKeys<T> = T extends object
	? {
			[K in keyof T]: `${Exclude<K, symbol>}${DotKeys<T[K]> extends never
				? ''
				: `.${DotKeys<T[K]>}`}`;
		}[keyof T]
	: never;

export type GetDotKey<
	T extends Record<string | number, any>,
	K extends string,
> = K extends `${infer U}.${infer Rest}` ? GetDotKey<T[U], Rest> : T[K];

export type PreferenceLocation = 'global' | 'project';
export interface PreferenceOptions {
	location?: PreferenceLocation;
	/**
	 * If `true`, the server will be reloaded after setting the preference.
	 * If `false`, the server will not be reloaded after setting the preference.
	 *
	 * Defaults to `true`.
	 */
	reloadServer?: boolean;
}

type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

export type PreferenceKey = DotKeys<Preferences>;
export interface PreferenceList extends Record<PreferenceLocation, DeepPartial<PublicPreferences>> {
	fromAstroConfig: DeepPartial<Preferences>;
	defaults: PublicPreferences;
}

export interface AstroPreferences {
	get<Key extends PreferenceKey>(
		key: Key,
		opts?: PreferenceOptions,
	): Promise<GetDotKey<Preferences, Key>>;
	set<Key extends PreferenceKey>(
		key: Key,
		value: GetDotKey<Preferences, Key>,
		opts?: PreferenceOptions,
	): Promise<void>;
	getAll(): Promise<PublicPreferences>;
	list(opts?: PreferenceOptions): Promise<PreferenceList>;
	ignoreNextPreferenceReload: boolean;
}

export function isValidKey(key: string): key is PreferenceKey {
	return dget(DEFAULT_PREFERENCES, key) !== undefined;
}
export function coerce(key: string, value: unknown) {
	const type = typeof dget(DEFAULT_PREFERENCES, key);
	// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
	switch (type) {
		case 'string':
			return value;
		case 'number':
			return Number(value);
		case 'boolean': {
			if (value === 'true' || value === 1) return true;
			if (value === 'false' || value === 0) return false;
			break;
		}
		default:
			throw new Error(`Incorrect value for ${key}`);
	}
	return value as any;
}

export default function createPreferences(config: AstroConfig, dotAstroDir: URL): AstroPreferences {
	const global = new PreferenceStore(getGlobalPreferenceDir());
	const project = new PreferenceStore(fileURLToPath(dotAstroDir));
	const stores: Record<PreferenceLocation, PreferenceStore> = { global, project };

	return {
		async get(key, { location } = {}) {
			if (!location) return project.get(key) ?? global.get(key) ?? dget(DEFAULT_PREFERENCES, key);
			return stores[location].get(key);
		},
		async set(key, value, { location = 'project', reloadServer = true } = {}) {
			stores[location].set(key, value);

			if (!reloadServer) {
				this.ignoreNextPreferenceReload = true;
			}
		},
		async getAll() {
			const allPrefs = Object.assign(
				{},
				DEFAULT_PREFERENCES,
				stores['global'].getAll(),
				stores['project'].getAll(),
			);

			const { _variables, ...prefs } = allPrefs;

			return prefs;
		},
		async list() {
			const { _variables, ...defaultPrefs } = DEFAULT_PREFERENCES;
			return {
				global: stores['global'].getAll(),
				project: stores['project'].getAll(),
				fromAstroConfig: mapFrom(DEFAULT_PREFERENCES, config),
				defaults: defaultPrefs,
			};

			function mapFrom(defaults: Preferences, astroConfig: Record<string, any>) {
				return Object.fromEntries(
					Object.entries(defaults).map(([key, _]) => [key, astroConfig[key]]),
				);
			}
		},
		ignoreNextPreferenceReload: false,
	};
}

// Adapted from https://github.com/sindresorhus/env-paths
function getGlobalPreferenceDir() {
	const name = 'astro';
	const homedir = os.homedir();
	const macos = () => path.join(homedir, 'Library', 'Preferences', name);
	const win = () => {
		const { APPDATA = path.join(homedir, 'AppData', 'Roaming') } = process.env;
		return path.join(APPDATA, name, 'Config');
	};
	const linux = () => {
		const { XDG_CONFIG_HOME = path.join(homedir, '.config') } = process.env;
		return path.join(XDG_CONFIG_HOME, name);
	};
	// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
	switch (process.platform) {
		case 'darwin':
			return macos();
		case 'win32':
			return win();
		default:
			return linux();
	}
}

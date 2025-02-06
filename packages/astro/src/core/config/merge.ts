import { mergeConfig as mergeViteConfig } from 'vite';
import { arraify, isObject, isURL } from '../util.js';

function mergeConfigRecursively(
	defaults: Record<string, any>,
	overrides: Record<string, any>,
	rootPath: string,
) {
	const merged: Record<string, any> = { ...defaults };
	for (const key in overrides) {
		const value = overrides[key];
		if (value == null) {
			continue;
		}

		let existing = merged[key];

		if (existing == null) {
			merged[key] = value;
			continue;
		}

		// fields that require special handling:
		if (key === 'vite' && rootPath === '') {
			merged[key] = mergeViteConfig(existing, value);
			continue;
		}
		if (key === 'server' && rootPath === '') {
			// server config can be a function or an object, if one of the two values is a function,
			// create a new wrapper function that merges them
			if (typeof existing === 'function' || typeof value === 'function') {
				merged[key] = (...args: any[]) => {
					const existingConfig = typeof existing === 'function' ? existing(...args) : existing;
					const valueConfig = typeof value === 'function' ? value(...args) : value;
					return mergeConfigRecursively(existingConfig, valueConfig, key);
				};
				continue;
			}
		}

		if (key === 'data' && rootPath === 'db') {
			// db.data can be a function or an array of functions. When
			// merging, make sure they become an array
			if (!Array.isArray(existing) && !Array.isArray(value)) {
				existing = [existing];
			}
		}

		if (Array.isArray(existing) || Array.isArray(value)) {
			merged[key] = [...arraify(existing ?? []), ...arraify(value ?? [])];
			continue;
		}
		if (isURL(existing) && isURL(value)) {
			merged[key] = value;
			continue;
		}
		if (isObject(existing) && isObject(value)) {
			merged[key] = mergeConfigRecursively(existing, value, rootPath ? `${rootPath}.${key}` : key);
			continue;
		}

		merged[key] = value;
	}
	return merged;
}

export function mergeConfig(
	defaults: Record<string, any>,
	overrides: Record<string, any>,
	isRoot = true,
): Record<string, any> {
	return mergeConfigRecursively(defaults, overrides, isRoot ? '' : '.');
}

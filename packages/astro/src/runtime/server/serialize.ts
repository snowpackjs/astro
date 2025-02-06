import type { ValueOf } from '../../type-utils.js';
import type { AstroComponentMetadata } from '../../types/public/internal.js';

const PROP_TYPE = {
	Value: 0,
	JSON: 1, // Actually means Array
	RegExp: 2,
	Date: 3,
	Map: 4,
	Set: 5,
	BigInt: 6,
	URL: 7,
	Uint8Array: 8,
	Uint16Array: 9,
	Uint32Array: 10,
	Infinity: 11,
};

function serializeArray(
	value: any[],
	metadata: AstroComponentMetadata | Record<string, any> = {},
	parents = new WeakSet<any>(),
): any[] {
	if (parents.has(value)) {
		throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
	}
	parents.add(value);
	const serialized = value.map((v) => {
		return convertToSerializedForm(v, metadata, parents);
	});
	parents.delete(value);
	return serialized;
}

function serializeObject(
	value: Record<any, any>,
	metadata: AstroComponentMetadata | Record<string, any> = {},
	parents = new WeakSet<any>(),
): Record<any, any> {
	if (parents.has(value)) {
		throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
	}
	parents.add(value);
	const serialized = Object.fromEntries(
		Object.entries(value).map(([k, v]) => {
			return [k, convertToSerializedForm(v, metadata, parents)];
		}),
	);
	parents.delete(value);
	return serialized;
}

function convertToSerializedForm(
	value: any,
	metadata: AstroComponentMetadata | Record<string, any> = {},
	parents = new WeakSet<any>(),
): [ValueOf<typeof PROP_TYPE>, any] | [ValueOf<typeof PROP_TYPE>] {
	const tag = Object.prototype.toString.call(value);
	switch (tag) {
		case '[object Date]': {
			return [PROP_TYPE.Date, (value as Date).toISOString()];
		}
		case '[object RegExp]': {
			return [PROP_TYPE.RegExp, (value as RegExp).source];
		}
		case '[object Map]': {
			return [PROP_TYPE.Map, serializeArray(Array.from(value as Map<any, any>), metadata, parents)];
		}
		case '[object Set]': {
			return [PROP_TYPE.Set, serializeArray(Array.from(value as Set<any>), metadata, parents)];
		}
		case '[object BigInt]': {
			return [PROP_TYPE.BigInt, (value as bigint).toString()];
		}
		case '[object URL]': {
			return [PROP_TYPE.URL, (value as URL).toString()];
		}
		case '[object Array]': {
			return [PROP_TYPE.JSON, serializeArray(value, metadata, parents)];
		}
		case '[object Uint8Array]': {
			return [PROP_TYPE.Uint8Array, Array.from(value as Uint8Array)];
		}
		case '[object Uint16Array]': {
			return [PROP_TYPE.Uint16Array, Array.from(value as Uint16Array)];
		}
		case '[object Uint32Array]': {
			return [PROP_TYPE.Uint32Array, Array.from(value as Uint32Array)];
		}
		default: {
			if (value !== null && typeof value === 'object') {
				return [PROP_TYPE.Value, serializeObject(value, metadata, parents)];
			}
			if (value === Infinity) {
				return [PROP_TYPE.Infinity, 1];
			}
			if (value === -Infinity) {
				return [PROP_TYPE.Infinity, -1];
			}
			if (value === undefined) {
				return [PROP_TYPE.Value];
			}
			return [PROP_TYPE.Value, value];
		}
	}
}

export function serializeProps(props: any, metadata: AstroComponentMetadata) {
	const serialized = JSON.stringify(serializeObject(props, metadata));
	return serialized;
}

import type { Context } from './context.js';
import { incrementId } from './context.js';
import type {
	ArrayObjectMapping,
	AstroPreactAttrs,
	PropNameToSignalMap,
	SignalLike,
	SignalToKeyOrIndexMap,
	Signals,
} from './types.js';

function isSignal(x: any): x is SignalLike {
	return x != null && typeof x === 'object' && typeof x.peek === 'function' && 'value' in x;
}

export function restoreSignalsOnProps(ctx: Context, props: Record<string, any>) {
	// Restore signal props that were mutated for serialization
	let propMap: PropNameToSignalMap;
	if (ctx.propsToSignals.has(props)) {
		propMap = ctx.propsToSignals.get(props)!;
	} else {
		propMap = new Map();
		ctx.propsToSignals.set(props, propMap);
	}
	for (const [key, signal] of propMap) {
		props[key] = signal;
	}
	return propMap;
}

export function serializeSignals(
	ctx: Context,
	props: Record<string, any>,
	attrs: AstroPreactAttrs,
	map: PropNameToSignalMap,
) {
	// Check for signals
	const signals: Signals = {};
	for (const [key, value] of Object.entries(props)) {
		const isPropArray = Array.isArray(value);
		// `typeof null` is 'object' in JS, so we need to check for `null` specifically
		const isPropObject =
			!isSignal(value) && typeof props[key] === 'object' && props[key] !== null && !isPropArray;

		if (isPropObject || isPropArray) {
			const values = isPropObject ? Object.keys(props[key]) : value;
			values.forEach((valueKey: number | string, valueIndex: number) => {
				const signal = isPropObject ? props[key][valueKey] : valueKey;
				if (isSignal(signal)) {
					const keyOrIndex = isPropObject ? valueKey.toString() : valueIndex;

					props[key] = isPropObject
						? Object.assign({}, props[key], { [keyOrIndex]: signal.peek() })
						: props[key].map((v: SignalLike, i: number) =>
								i === valueIndex ? [signal.peek(), i] : v,
							);

					const currentMap = (map.get(key) || []) as SignalToKeyOrIndexMap;
					map.set(key, [...currentMap, [signal, keyOrIndex]]);

					const currentSignals = (signals[key] || []) as ArrayObjectMapping;
					signals[key] = [...currentSignals, [getSignalId(ctx, signal), keyOrIndex]];
				}
			});
		} else if (isSignal(value)) {
			// Set the value to the current signal value
			// This mutates the props on purpose, so that it will be serialized correct.
			props[key] = value.peek();
			map.set(key, value);

			signals[key] = getSignalId(ctx, value);
		}
	}

	if (Object.keys(signals).length) {
		attrs['data-preact-signals'] = JSON.stringify(signals);
	}
}

function getSignalId(ctx: Context, item: SignalLike) {
	let id = ctx.signals.get(item);
	if (!id) {
		id = incrementId(ctx);
		ctx.signals.set(item, id);
	}

	return id;
}

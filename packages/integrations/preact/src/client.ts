import { h, hydrate, render } from 'preact';
import StaticHtml from './static-html.js';
import type { SignalLike } from './types.js';

const sharedSignalMap = new Map<string, SignalLike>();

export default (element: HTMLElement) =>
	async (
		Component: any,
		props: Record<string, any>,
		{ default: children, ...slotted }: Record<string, any>,
		{ client }: Record<string, string>,
	) => {
		if (!element.hasAttribute('ssr')) return;
		for (const [key, value] of Object.entries(slotted)) {
			props[key] = h(StaticHtml, { value, name: key });
		}
		let signalsRaw = element.dataset.preactSignals;
		if (signalsRaw) {
			const { signal } = await import('@preact/signals');
			let signals: Record<string, string | [string, number][]> = JSON.parse(
				element.dataset.preactSignals!,
			);
			for (const [propName, signalId] of Object.entries(signals)) {
				if (Array.isArray(signalId)) {
					signalId.forEach(([id, indexOrKeyInProps]) => {
						const mapValue = props[propName][indexOrKeyInProps];
						let valueOfSignal = mapValue;

						// not an property key
						if (typeof indexOrKeyInProps !== 'string') {
							valueOfSignal = mapValue[0];
							indexOrKeyInProps = mapValue[1];
						}

						if (!sharedSignalMap.has(id)) {
							const signalValue = signal(valueOfSignal);
							sharedSignalMap.set(id, signalValue);
						}
						props[propName][indexOrKeyInProps] = sharedSignalMap.get(id);
					});
				} else {
					if (!sharedSignalMap.has(signalId)) {
						const signalValue = signal(props[propName]);
						sharedSignalMap.set(signalId, signalValue);
					}
					props[propName] = sharedSignalMap.get(signalId);
				}
			}
		}

		const bootstrap = client !== 'only' ? hydrate : render;

		bootstrap(
			h(Component, props, children != null ? h(StaticHtml, { value: children }) : children),
			element,
		);

		// Preact has no "unmount" option, but you can use `render(null, element)`
		element.addEventListener('astro:unmount', () => render(null, element), { once: true });
	};

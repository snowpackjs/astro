import { Suspense } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { createComponent, hydrate, render } from 'solid-js/web';

const alreadyInitializedElements = new WeakMap<Element, any>();

export default (element: HTMLElement) =>
	(Component: any, props: any, slotted: any, { client }: { client: string }) => {
		if (!element.hasAttribute('ssr')) return;
		const isHydrate = client !== 'only';
		const bootstrap = isHydrate ? hydrate : render;

		let slot: HTMLElement | null;
		let _slots: Record<string, any> = {};
		if (Object.keys(slotted).length > 0) {
			// hydratable
			if (client !== 'only') {
				const iterator = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, (node) => {
					if (node === element) return NodeFilter.FILTER_SKIP;
					if (node.nodeName === 'ASTRO-SLOT') return NodeFilter.FILTER_ACCEPT;
					if (node.nodeName === 'ASTRO-ISLAND') return NodeFilter.FILTER_REJECT;
					return NodeFilter.FILTER_SKIP;
				});
				while ((slot = iterator.nextNode() as HTMLElement | null))
					_slots[slot.getAttribute('name') || 'default'] = slot;
			}
			for (const [key, value] of Object.entries(slotted)) {
				if (_slots[key]) continue;
				_slots[key] = document.createElement('astro-slot');
				if (key !== 'default') _slots[key].setAttribute('name', key);
				_slots[key].innerHTML = value;
			}
		}

		const { default: children, ...slots } = _slots;
		const renderId = element.dataset.solidRenderId;
		if (alreadyInitializedElements.has(element)) {
			// update the mounted component
			alreadyInitializedElements.get(element)!(
				// reconcile will make sure to apply as little updates as possible, and also remove missing values w/o breaking reactivity
				reconcile({
					...props,
					...slots,
					children,
				}),
			);
		} else {
			const [store, setStore] = createStore({
				...props,
				...slots,
				children,
			});
			// store the function to update the current mounted component
			alreadyInitializedElements.set(element, setStore);

			const dispose = bootstrap(
				() => {
					const inner = () => createComponent(Component, store);

					if (isHydrate) {
						return createComponent(Suspense, {
							get children() {
								return inner();
							},
						});
					} else {
						return inner();
					}
				},
				element,
				{
					renderId,
				},
			);
			element.addEventListener('astro:unmount', () => dispose(), { once: true });
		}
	};
